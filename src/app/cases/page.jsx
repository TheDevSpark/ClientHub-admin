"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function CasesPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cases, setCases] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateText, setUpdateText] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError("");
      const { data: casesData, error: casesError } = await supabase
        .from("cases")
        .select("case_id, created_at, name, description, type, status, user_id")
        .order("created_at", { ascending: false });

      if (!isMounted) return;
      if (casesError) {
        setError(casesError?.message || "Failed to load cases");
        setLoading(false);
        return;
      }
      const normalized = (casesData || []).map((c) => ({
        id: c.case_id,
        caseId: c.case_id,
        name: c.name || "",
        description: c.description || "",
        type: c.type || "",
        status: c.status || "",
        userId: c.user_id || "",
        created: c.created_at
          ? new Date(c.created_at).toLocaleDateString()
          : "",
      }));
      setCases(normalized);
      setLoading(false);
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  async function reloadCases() {
    setLoading(true);
    setError("");
    const { data: casesData, error: casesError } = await supabase
      .from("cases")
      .select("case_id, created_at, name, description, type, status, user_id")
      .order("created_at", { ascending: false });
    if (casesError) {
      setError(casesError?.message || "Failed to load cases");
      setLoading(false);
      return;
    }
    const normalized = (casesData || []).map((c) => ({
      id: c.case_id,
      caseId: c.case_id,
      name: c.name || "",
      description: c.description || "",
      type: c.type || "",
      status: c.status || "",
      userId: c.user_id || "",
      created: c.created_at ? new Date(c.created_at).toLocaleDateString() : "",
    }));
    setCases(normalized);
    setLoading(false);
  }

  async function fetchUserEmail(userId) {
    if (!userId) {
      console.warn("No userId provided");
      return null;
    }

    try {
      console.log("Fetching email for userId:", userId);
      const res = await fetch("/api/get-user-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      console.log("Email API response:", data);

      if (data.email) {
        return data.email;
      } else {
        console.warn("No email found:", data.error);
        return null;
      }
    } catch (err) {
      console.error("Failed to fetch user email:", err);
      return null;
    }
  }

  async function openStatusModal(caseItem) {
    setSelectedCase(caseItem);
    setActionError("");
    setModalEmail("");
    setModalOpen(true);

    // Fetch email if case is approved
    if (caseItem?.status === "Payment Pending" && caseItem?.userId) {
      const email = await fetchUserEmail(caseItem.userId);
      if (email) {
        setModalEmail(email);
      }
    }
  }

  function closeStatusModal() {
    setModalOpen(false);
    setSelectedCase(null);
    setActionError("");
    setModalEmail("");
  }

  async function updateCaseStatus(caseId, newStatus) {
    setActionLoading(true);
    setActionError("");

    try {
      const res = await fetch("/api/update-case-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update case");

      await reloadCases();
      setActionLoading(false);
      return true;
    } catch (err) {
      setActionError(err.message);
      setActionLoading(false);
      return false;
    }
    console.log("updateCaseStatus:", caseId, newStatus);
    const { data, error } = await supabase
      .from("cases")
      .update({ status: newStatus })
      .eq("case_id", caseId)
      .select();

    console.log("Update result:", { data, error });
  }

  async function handleApprove() {
    if (!selectedCase) return;
    const success = await updateCaseStatus(
      selectedCase.caseId,
      "Payment Pending"
    );
    if (success) {
      // Update the selectedCase status
      const updatedCase = { ...selectedCase, status: "Payment Pending" };
      setSelectedCase(updatedCase);

      // Update the cases array immediately
      setCases((prevCases) =>
        prevCases.map((c) =>
          c.caseId === selectedCase.caseId
            ? { ...c, status: "Payment Pending" }
            : c
        )
      );

      // Fetch email after approval
      if (updatedCase.userId) {
        const email = await fetchUserEmail(updatedCase.userId);
        if (email) {
          setModalEmail(email);
        }
      }
    }
  }

  async function handleReject() {
    if (!selectedCase) return;
    const success = await updateCaseStatus(selectedCase.caseId, "Rejected");
    if (success) {
      setSelectedCase({ ...selectedCase, status: "Rejected" });
      setCases((prevCases) =>
        prevCases.map((c) =>
          c.caseId === selectedCase.caseId ? { ...c, status: "Rejected" } : c
        )
      );
      closeStatusModal();
    }
  }

  async function handleSendInvoice() {
    if (!selectedCase) return;

    let emailToSend = modalEmail;

    // ✅ If modalEmail is empty, fetch from userId
    if (!emailToSend && selectedCase.userId) {
      const fetchedEmail = await fetchUserEmail(selectedCase.userId);
      if (fetchedEmail) {
        emailToSend = fetchedEmail;
        setModalEmail(fetchedEmail);
      } else {
        alert("User email not found!");
        return;
      }
    }

    console.log("Composing email to:", emailToSend);

    const subject = `Invoice for your case "${selectedCase.name}"`;
    const body = `Hello,%0D%0A%0D%0AYour case "${selectedCase.name}" has been approved and is now pending payment.%0D%0A%0D%0APlease complete your payment at your earliest convenience.%0D%0A%0D%0AThank you,%0D%0AAmbar Legal Services`;

    // ✅ Universal mail link (no handler required)
    const mailtoLink = `mailto:${emailToSend}?subject=${encodeURIComponent(
      subject
    )}&body=${body}`;

    // ✅ Hidden anchor trick to open mail app
    const link = document.createElement("a");
    link.href = mailtoLink;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Invoice compose window opened!");
  }

  async function handleMarkPaid() {
    if (!selectedCase) return;
    const success = await updateCaseStatus(selectedCase.caseId, "In Progress");
    if (success) {
      // Update modal's selected case
      const updatedCase = { ...selectedCase, status: "In Progress" };
      setSelectedCase(updatedCase);

      // Also update the cases array to reflect the change immediately
      setCases((prevCases) =>
        prevCases.map((c) =>
          c.caseId === selectedCase.caseId ? { ...c, status: "In Progress" } : c
        )
      );

      console.log("Status updated to In Progress");
    }
  }

  async function handleComplete() {
    if (!selectedCase) return;
    const success = await updateCaseStatus(selectedCase.caseId, "Completed");
    if (success) {
      setSelectedCase({ ...selectedCase, status: "Completed" });
      setCases((prevCases) =>
        prevCases.map((c) =>
          c.caseId === selectedCase.caseId ? { ...c, status: "Completed" } : c
        )
      );
      closeStatusModal();
    }
  }

  function openUpdateModal(caseItem) {
    setSelectedCase(caseItem);
    setUpdateText("");
    setUpdateModalOpen(true);
  }

  function closeUpdateModal() {
    setUpdateModalOpen(false);
    setSelectedCase(null);
  }
  async function handleSendUpdate() {
    if (!updateText.trim()) {
      toast.error("Please write an update before sending.");
      return;
    }

    try {
      setActionLoading(true);

      console.log("=== DEBUG START ===");
      console.log("Selected case:", selectedCase);
      console.log("Case ID type:", typeof selectedCase.caseId);
      console.log("Case ID value:", selectedCase.caseId);

      // First, verify the case exists and get current data
      const { data: checkData, error: checkError } = await supabase
        .from("cases")
        .select("case_id, case_updates, name")
        .eq("case_id", selectedCase.caseId);

      console.log("Check query result:", { checkData, checkError });

      if (checkError) {
        console.error("Check error:", checkError);
        throw new Error(`Check failed: ${checkError.message}`);
      }

      if (!checkData || checkData.length === 0) {
        console.error("Case not found with ID:", selectedCase.caseId);
        throw new Error("Case not found. Please refresh the page.");
      }

      const existing = checkData[0];
      console.log("Existing case data:", existing);

      let updatesArray = [];

      // Handle existing updates
      if (existing?.case_updates) {
        if (Array.isArray(existing.case_updates)) {
          updatesArray = [...existing.case_updates];
          console.log("Found existing updates array:", updatesArray);
        } else {
          console.log("case_updates is not array, wrapping it");
          updatesArray = [
            {
              title: "Previous Update",
              date: new Date().toLocaleDateString(),
              description: String(existing.case_updates),
            },
          ];
        }
      } else {
        console.log("No existing updates found");
      }

      // Add new update
      const newUpdate = {
        title: "New Update",
        date: new Date().toLocaleDateString(),
        description: updateText.trim(),
      };

      updatesArray.push(newUpdate);
      console.log("New update to add:", newUpdate);
      console.log("Final updates array:", updatesArray);

      // Perform the update
      const {
        data: updateData,
        error: updateError,
        status,
        statusText,
      } = await supabase
        .from("cases")
        .update({ case_updates: updatesArray })
        .eq("case_id", selectedCase.caseId)
        .select("case_id, case_updates");

      console.log("Update response:", {
        data: updateData,
        error: updateError,
        status,
        statusText,
      });

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error(`Update failed: ${updateError.message}`);
      }

      if (!updateData || updateData.length === 0) {
        console.error("Update returned no data");
        throw new Error(
          "Update completed but returned no data. The update may have been saved."
        );
      }

      console.log("Update successful:", updateData[0]);
      console.log("=== DEBUG END ===");

      toast.success("Case update sent successfully!");
      setUpdateText("");
      setUpdateModalOpen(false);

      // Reload cases to verify
      await reloadCases();
    } catch (err) {
      console.error("=== ERROR ===");
      console.error("Error details:", err);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      toast.error(`Failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  }

  const filtered = cases.filter((c) => {
    const q = query.toLowerCase();
    const idStr = String(c.id || "").toLowerCase();
    const nameStr = String(c.name || "").toLowerCase();
    const descStr = String(c.description || "").toLowerCase();
    return idStr.includes(q) || nameStr.includes(q) || descStr.includes(q);
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="mb-4">
              <h1 className="text-xl font-semibold text-foreground">Cases</h1>
              <p className="text-sm text-muted-foreground">
                Manage and track all client cases
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-5 py-4 border-b border-border">
                <div>
                  <div className="text-sm font-medium text-card-foreground">
                    All Cases
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {filtered.length} cases found
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-64 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    placeholder="Search cases..."
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium">S No.</th>
                      <th className="px-5 py-3 text-left font-medium">Name</th>
                      <th className="px-5 py-3 text-left font-medium">
                        Description
                      </th>
                      <th className="px-5 py-3 text-left font-medium">Type</th>
                      <th className="px-5 py-3 text-left font-medium">
                        Status
                      </th>
                      <th className="px-5 py-3 text-left font-medium">
                        Created
                      </th>
                      <th className="px-5 py-3 text-left font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr>
                        <td
                          className="px-5 py-6 text-muted-foreground"
                          colSpan={7}
                        >
                          Loading…
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td className="px-5 py-6 text-red-600" colSpan={7}>
                          {error}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((c, idx) => (
                        <tr key={idx} className="hover:bg-muted/50">
                          <td className="px-5 py-3 text-foreground">
                            {idx + 1}
                          </td>
                          <td className="px-5 py-3 text-foreground">
                            {c.name}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {c.description}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {c.type}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {c.status}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {c.created}
                          </td>
                          <td className="px-5 py-3">
                            <button
                              className="text-primary hover:underline"
                              onClick={() => openStatusModal(c)}
                            >
                              View Status
                            </button>
                            <button
                              className="text-blue-600 hover:underline"
                              onClick={() => {
                                setSelectedCase(c);
                                setUpdateModalOpen(true);
                              }}
                            >
                              Update
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {modalOpen && selectedCase && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                <div className="w-full max-w-md rounded-xl bg-card text-card-foreground shadow-lg border border-border">
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div className="font-semibold">
                      {" "}
                      {selectedCase.name
                        ? `${selectedCase.name}`
                        : `Case Status`}
                    </div>
                    <button
                      className="text-muted-foreground hover:text-foreground"
                      onClick={closeStatusModal}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="px-5 py-4 space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Current Status
                      </div>
                      <div className="text-base font-medium">
                        {selectedCase.status || "Review"}
                      </div>
                    </div>

                    {actionError ? (
                      <div className="text-sm text-red-600">{actionError}</div>
                    ) : null}

                    {/* Actions based on status */}
                    {(!selectedCase.status ||
                      selectedCase.status === "Review") && (
                      <div className="flex gap-3">
                        <button
                          disabled={actionLoading}
                          onClick={handleApprove}
                          className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={handleReject}
                          className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {selectedCase.status === "Payment Pending" && (
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            User Email
                          </div>
                          <div className="text-base font-medium">
                            {modalEmail || "Loading..."}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            disabled={actionLoading}
                            onClick={handleSendInvoice}
                            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            Send Invoice
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={handleMarkPaid}
                            className="inline-flex items-center rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                          >
                            Mark as Paid
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedCase.status === "In Progress" && (
                      <div className="flex gap-3">
                        <button
                          disabled={actionLoading}
                          onClick={handleComplete}
                          className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                          Mark as Completed
                        </button>
                      </div>
                    )}

                    {(selectedCase.status === "Rejected" ||
                      selectedCase.status === "Completed") && (
                      <div className="text-sm text-muted-foreground">
                        No further actions available.
                      </div>
                    )}
                  </div>
                  <div className="px-5 py-4 border-t border-border flex justify-end">
                    <button
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onClick={closeStatusModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {updateModalOpen && selectedCase && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                <div className="w-full max-w-md rounded-xl bg-card text-card-foreground shadow-lg border border-border">
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div className="font-semibold">
                      Send Update — {selectedCase.name}
                    </div>
                    <button
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setUpdateModalOpen(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="px-5 py-4 space-y-4">
                    <textarea
                      value={updateText}
                      onChange={(e) => setUpdateText(e.target.value)}
                      placeholder="Write case update here..."
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      rows={5}
                    ></textarea>

                    <button
                      disabled={actionLoading}
                      onClick={handleSendUpdate}
                      className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
