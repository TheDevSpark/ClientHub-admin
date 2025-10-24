"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabaseClient";
import { CircleArrowLeft, EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectValue,
} from "@/components/ui/select";
import { SelectTrigger } from "@radix-ui/react-select";
import Document from "next/document";

export default function DocumentDetailPage({ params }) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const { id } = params;
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [docData, setDocData] = useState(null);

  useEffect(() => {
    fetchDocument();
    getTemplates();
  }, []);

  const fetchDocument = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("doc_id", id)
      .single();

    if (!error && data) setDocument(data);
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

  const getTemplates = async () => {
    fetch("/api/get-template-files")
      .then((res) => res.json()) // parse JSON
      .then((data) => {
        console.log(data); // now you can see your actual template data
        setTemplates(data);
      })
      .catch((err) => console.error("Error fetching templates:", err));
  };

  const handleApplyTemplate = async (selectedTemplate) => {
    const res = await fetch("/api/generate-docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateName: selectedTemplate,
        formData: formData,
      }),
    });

    if (!res.ok) {
      console.error("Failed to generate docx");
      return;
    }

    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = selectedTemplate.replace(".docx", "_filled.docx");
      window.document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      console.warn("Download skipped: running in a non-browser environment");
    }
  };

  if (loading) return <p className="p-10">Loading...</p>;
  if (!document) return <p className="p-10">Document not found.</p>;

  const formData = document.form_data;

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-[#0a0a0a] text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      <div className="max-w-3xl mx-auto py-10 px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {formData?.title || formData?.form_name || "Document Details"}
          </h1>
          <div className="options flex gap-2">
            <button
              onClick={() => history.back()}
              className={`p-2 rounded-lg transition ${
                isDarkMode ? "hover:bg-[#27272a]" : "hover:bg-gray-100"
              }`}
            >
              <CircleArrowLeft className="w-5 h-5" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Form Options</DropdownMenuLabel>

                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setOpenDialog(true)}>
                    Apply Template
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p
          className={`text-sm mb-6 ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Submitted on {formatDate(formData?.submitted_at)}
        </p>

        <div className="flex flex-col gap-4">
          {formData?.data
            ?.filter((q) => {
              const val = q.value;
              const v =
                typeof val === "object" && val !== null
                  ? val.value ?? JSON.stringify(val)
                  : val;
              return v && v !== "null" && v !== "";
            })
            .map((q, i) => {
              const val = q.value;
              const displayValue =
                typeof val === "object" && val !== null
                  ? val.value ?? JSON.stringify(val)
                  : val;

              return (
                <div key={i}>
                  <h2 className="font-semibold">{q.name || q.label}</h2>
                  <p className="text-gray-500">{String(displayValue)}</p>
                </div>
              );
            })}
        </div>
      </div>

      {/* Apply Template Modal */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Template</DialogTitle>
            <DialogDescription>
              <Select onValueChange={setSelectedTemplate}>
                <SelectTrigger className="w-full my-3">
                  <SelectValue placeholder="Select a Template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Templates</SelectLabel>
                    {templates.map((data, index) => (
                      <SelectItem value={data} key={index}>
                        {data.split(".")[0]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button
              className="mx-2 bg-gray-800 hover:bg-gray-900"
              onClick={() => handleApplyTemplate(selectedTemplate)}
            >
              Apply
            </Button>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
