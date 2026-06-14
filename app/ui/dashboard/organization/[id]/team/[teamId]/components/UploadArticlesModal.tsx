"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { importArticlesServer } from "@/app/services/article-server.service";

interface UploadArticlesModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
    onSuccess: () => void;
}

export function UploadArticlesModal({ isOpen, onClose, teamId, onSuccess }: UploadArticlesModalProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const processFile = async (file: File) => {
        setLoading(true);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Read as json, expecting header row
            const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
            
            // Map headers exactly to our fields
            // Assuming headers might be: PMID, Title, Authors, Citation, First Author, Journal/Book, Publication Year, Create Date, PMCID, NIHMS ID, DOI
            const parsedArticles = rawJson.map((row: any) => ({
                pmid: row["PMID"] || row["pmid"] || "",
                title: row["Title"] || row["title"] || "",
                authors: row["Authors"] || row["authors"] || "",
                citation: row["Citation"] || row["citation"] || "",
                firstAuthor: row["First Author"] || row["first author"] || "",
                journal: row["Journal/Book"] || row["journal"] || "",
                publicationYear: row["Publication Year"] || row["publication year"] || "",
                createDate: row["Create Date"] || row["create date"] || "",
                pmcid: row["PMCID"] || row["pmcid"] || "",
                nihmsId: row["NIHMS ID"] || row["nihms id"] || "",
                doi: row["DOI"] || row["doi"] || ""
            })).filter(a => a.pmid || a.title); // basic filter to remove empty rows

            if (parsedArticles.length === 0) {
                toast.error("No valid articles found in the file.");
                return;
            }

            const { error } = await importArticlesServer(teamId, parsedArticles);
            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success(`Successfully imported ${parsedArticles.length} articles!`);
            onSuccess();
            onClose();
        } catch (e: any) {
            console.error("File processing error:", e);
            toast.error("Failed to parse the file. Please ensure it is a valid Excel or CSV file.");
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
            animation: "fadeIn 0.2s ease",
        }}>
            <div style={{
                width: "100%", maxWidth: 500, background: "var(--card)",
                borderRadius: 20, padding: 32, border: "1px solid var(--border)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.15)",
                animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "var(--foreground)" }}>
                        Upload Articles
                    </h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--muted-foreground)" }}>
                        &times;
                    </button>
                </div>
                
                <p style={{ margin: "0 0 20px", fontSize: "0.9rem", color: "var(--muted-foreground)" }}>
                    Upload an Excel (.xlsx) or CSV file containing your articles. Ensure the file has columns like PMID, Title, Authors, etc.
                </p>

                <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    style={{
                        border: `2px dashed ${isDragging ? "oklch(0.5 0.25 290)" : "var(--border)"}`,
                        borderRadius: 16, padding: "40px 20px", textAlign: "center",
                        background: isDragging ? "oklch(0.5 0.25 290 / 0.05)" : "var(--muted)",
                        cursor: "pointer", transition: "all 0.2s"
                    }}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <input 
                        id="file-upload" 
                        type="file" 
                        accept=".xlsx, .xls, .csv" 
                        style={{ display: "none" }} 
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) processFile(file);
                            e.target.value = '';
                        }}
                        disabled={loading}
                    />
                    <div style={{ fontSize: "2rem", marginBottom: 12 }}>📄</div>
                    <div style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: 8 }}>
                        {loading ? "Processing..." : "Click to upload or drag and drop"}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                        Supports Excel (.xlsx, .xls) and CSV
                    </div>
                </div>
            </div>
        </div>
    );
}
