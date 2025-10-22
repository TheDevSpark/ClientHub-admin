"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Search, FileText, ChevronLeft, ChevronRight, X, Eye, Calendar, Hash } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDocumentsPage() {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
      setFilteredDocs(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = documents.filter((doc) => {
      const searchLower = searchQuery.toLowerCase();
      const formTitle = doc.form_data?.title || doc.form_data?.form_name || "";
      return formTitle.toLowerCase().includes(searchLower);
    });
    setFilteredDocs(filtered);
    setCurrentPage(1);
  }, [searchQuery, documents]);

  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocs = filteredDocs.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

 const renderFormDataTable = (formData) => {
  if (!formData) return <p className="text-gray-500">No data available</p>;

  // Extract question-answer pairs clearly
  const qnaRows = [];

    // 🧩 Extract nested questions properly
  const nestedQuestions =
    formData?.questions?.length
      ? formData.questions
      : formData?.raw_data?.questions?.length
      ? formData.raw_data.questions
      : formData?.raw_data?.raw_data?.submission?.questions || [];



  if (nestedQuestions.length > 0) {
    nestedQuestions.forEach((q, idx) => {
      const questionText = q.name || q.label || q.question || `Question ${idx + 1}`;
      const answerValue = q.value || q.answer || formData?.answers?.[q.id] || "—";

      qnaRows.push({
        question: questionText,
        answer:
          typeof answerValue === "object"
            ? JSON.stringify(answerValue)
            : answerValue,
      });
    });
  }

  // ✅ Fallback: answers object (if no questions)
  if (qnaRows.length === 0 && formData.answers) {
    Object.entries(formData.answers).forEach(([key, val]) => {
      qnaRows.push({
        question: key,
        answer: typeof val === "object" ? JSON.stringify(val) : val,
      });
    });
  }

  // ✅ Add meta info
  const metaInfo = [
    { label: "Form Title", value: formData.title || formData.form_name },
    { label: "Form ID", value: formData.form_id },
    { label: "Submission ID", value: formData.submission_id },
    {
      label: "Submitted At",
      value: formData.submitted_at ? formatDate(formData.submitted_at) : "—",
    },
  ].filter((item) => item.value);

  // 🔍 Debug log (you can remove later)
  console.log("🧩 Extracted Questions:", nestedQuestions);
  console.log("✅ Q&A Rows:", qnaRows);


  return (
    <div className="space-y-6">
      {/* Meta info table */}
      <div
        className={`rounded-lg border overflow-hidden ${
          isDarkMode ? "border-[#27272a]" : "border-gray-200"
        }`}
      >
        <table className="w-full">
          <thead className={isDarkMode ? "bg-[#18181b]" : "bg-gray-100"}>
            <tr>
              <th
                className={`px-6 py-3 text-left text-sm font-bold uppercase ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Field
              </th>
              <th
                className={`px-6 py-3 text-left text-sm font-bold uppercase ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Value
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              isDarkMode ? "divide-[#27272a]" : "divide-gray-200"
            }`}
          >
            {metaInfo.map((item, idx) => (
              <tr
                key={idx}
                className={isDarkMode ? "hover:bg-[#0a0a0a]" : "hover:bg-gray-50"}
              >
                <td
                  className={`px-6 py-3 font-medium ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  {item.label}
                </td>
                <td
                  className={`px-6 py-3 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {item.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Question–Answer Table */}
      {qnaRows.length > 0 && (
        <div
          className={`rounded-lg border overflow-hidden ${
            isDarkMode ? "border-[#27272a]" : "border-gray-200"
          }`}
        >
          <table className="w-full">
            <thead className={isDarkMode ? "bg-[#18181b]" : "bg-gray-100"}>
              <tr>
                <th
                  className={`px-6 py-3 text-left text-sm font-bold uppercase ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Question
                </th>
                <th
                  className={`px-6 py-3 text-left text-sm font-bold uppercase ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Answer
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDarkMode ? "divide-[#27272a]" : "divide-gray-200"
              }`}
            >
              {qnaRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={isDarkMode ? "hover:bg-[#0a0a0a]" : "hover:bg-gray-50"}
                >
                  <td
                    className={`px-6 py-3 font-medium ${
                      isDarkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {row.question}
                  </td>
                  <td
                    className={`px-6 py-3 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <div className="break-words whitespace-pre-wrap">
                      {row.answer || "—"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


    </div>
  );
};


  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-[#0a0a0a] text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Documents</h1>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            All submitted form data ({filteredDocs.length} total)
          </p>
        </div>

        <div className="mb-6">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border max-w-md ${
              isDarkMode
                ? "bg-[#18181b] border-[#27272a]"
                : "bg-white border-gray-200"
            }`}
          >
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title..."
              className="w-full bg-transparent outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading documents...</p>
          </div>
        ) : paginatedDocs.length > 0 ? (
          <>
            {/* Table View */}
            <div className={`rounded-lg border overflow-hidden ${
              isDarkMode ? "border-[#27272a]" : "border-gray-200"
            }`}>
              <table className="w-full">
                <thead className={isDarkMode ? "bg-[#18181b]" : "bg-gray-100"}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                      <Hash className="w-4 h-4 inline mr-1" />
                     SNO
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                      <FileText className="w-4 h-4 inline mr-1" />
                      Form Title
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Submitted At
                    </th>
                    <th className={`px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? "divide-[#27272a]" : "divide-gray-200"}`}>
                  {paginatedDocs.map((doc, index) => (
                    <tr 
                      key={doc.id || index}
                      className={`transition ${
                        isDarkMode ? "hover:bg-[#18181b]" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">
                          {doc.form_data?.title || doc.form_data?.form_name || "Untitled Document"}
                        </div>
                        {doc.form_data?.submission_id && (
                          <div className={`text-xs mt-1 font-mono ${
                            isDarkMode ? "text-gray-500" : "text-gray-400"
                          }`}>
                            ID: {doc.form_data.submission_id.substring(0, 20)}...
                          </div>
                        )}
                      </td>
                      <td className={`px-6 py-4 text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {formatDate(doc.form_data?.submitted_at || doc.created_at)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                            isDarkMode
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-blue-500 hover:bg-blue-600 text-white"
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode
                      ? "bg-[#18181b] border-[#27272a] hover:bg-[#222226]"
                      : "bg-white border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-sm">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode
                      ? "bg-[#18181b] border-[#27272a] hover:bg-[#222226]"
                      : "bg-white border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <FileText className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? "text-gray-700" : "text-gray-300"}`} />
            <p className="text-gray-500">No documents found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-blue-500 hover:text-blue-600 text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
              isDarkMode ? "bg-[#18181b] text-white" : "bg-white text-gray-900"
            }`}
          >
            <div className={`sticky top-0 px-6 py-4 border-b flex justify-between items-center ${
              isDarkMode ? "border-[#27272a] bg-[#18181b]" : "border-gray-200 bg-white"
            }`}>
              <div>
                <h2 className="text-xl font-bold">Form Submission Details</h2>
                <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {selectedDoc.form_data?.title || selectedDoc.form_data?.form_name || "Untitled Document"}
                </p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className={`p-2 rounded-lg transition ${
                  isDarkMode ? "hover:bg-[#27272a]" : "hover:bg-gray-100"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6">
              {renderFormDataTable(selectedDoc.form_data)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}