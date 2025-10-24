import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import createReport from "docx-templates";

export async function POST(req) {
  try {
    const { templateName, formData } = await req.json();

    if (!formData || !formData.data) {
      return NextResponse.json(
        { error: "Invalid formData structure. Expected { data: [...] }" },
        { status: 400 }
      );
    }

    // ✅ Path to your template file
    const templatePath = path.join(
      process.cwd(),
      "public",
      "templates",
      templateName
    );

    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: `Template not found: ${templateName}` },
        { status: 404 }
      );
    }

    const template = fs.readFileSync(templatePath);

    // ✅ Build data object dynamically
    const data = {};

    // Flatten all form fields
    formData.data.forEach((field) => {
      const key = (field.name || field.label || "")
        .replace(/[^a-zA-Z0-9_]/g, "_") // make it template-safe
        .toLowerCase();

      const val =
        typeof field.value === "object" && field.value !== null
          ? field.value.value ?? JSON.stringify(field.value)
          : field.value;

      if (val !== null && val !== "" && val !== "null") {
        data[key] = val;
      }
    });

    // ✅ Include metadata like title, submitter name, etc.
    data.form_title = formData.title || "";
    data.submitted_at = formData.submitted_at || "";
    data.submitter_name = formData.submitter_name || "";

    console.log("✅ Data ready for DOCX:", data);

    // ✅ Generate DOCX safely
    const buffer = await createReport({
      template,
      data,
      noSandbox: true,
      cmdDelimiter: ["{", "}"],
      parser: (tag) => (scope) => scope[tag], // prevents ReferenceError
    });

    const fileName = `filled_${templateName.replace(".docx", "")}.docx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("Error generating DOCX:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
