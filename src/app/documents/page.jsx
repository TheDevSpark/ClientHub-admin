"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Eye } from "lucide-react";

export default function AdminDocumentsPage() {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    console.log(data);

    if (!error && data) setDocuments(data);
    setLoading(false);
  };

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

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-[#0a0a0a] text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      <div className="max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Documents</h1>

        {loading ? (
          <p>Loading...</p>
        ) : documents.length === 0 ? (
          <p>No documents found</p>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`flex justify-between items-center p-4 rounded-lg border transition cursor-pointer ${
                  isDarkMode
                    ? "border-[#27272a] hover:bg-[#18181b]"
                    : "border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() => router.push(`/documents/${doc.doc_id}`)} // ✅ Navigate to document detail page
              >
                <div>
                  <h2 className="font-semibold">
                    {doc.form_data?.title ||
                      doc.form_data?.form_name ||
                      "Untitled Document"}
                  </h2>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Submitted on {formatDate(doc.form_data?.submitted_at)}
                  </p>
                </div>
                <Eye className="w-5 h-5" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
