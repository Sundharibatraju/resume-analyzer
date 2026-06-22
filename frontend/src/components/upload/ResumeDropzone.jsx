import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, X, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export default function ResumeDropzone({ onFileSelected, selectedFile, onClear, uploadProgress, isUploading }) {
  const [rejectionError, setRejectionError] = useState("");

  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      setRejectionError("");
      if (fileRejections.length > 0) {
        const reason = fileRejections[0].errors[0];
        if (reason.code === "file-too-large") {
          setRejectionError("File is too large. Maximum size is 10MB.");
        } else if (reason.code === "file-invalid-type") {
          setRejectionError("Unsupported file type. Please upload a PDF or DOCX.");
        } else {
          setRejectionError(reason.message);
        }
        return;
      }
      if (acceptedFiles.length > 0) {
        onFileSelected(acceptedFiles[0]);
      }
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE_BYTES,
    multiple: false,
    disabled: isUploading || !!selectedFile,
  });

  if (selectedFile) {
    return (
      <div className="rounded-2xl border-2 border-[var(--color-signal-clear)]/40 bg-[var(--color-signal-clear)]/8 p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[var(--color-signal-clear)]/20 flex items-center justify-center flex-shrink-0">
            <FileText size={22} className="text-[var(--color-signal-clear-deep)] dark:text-[var(--color-signal-clear)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{selectedFile.name}</p>
            <p className="text-xs opacity-55">{(selectedFile.size / 1024).toFixed(0)} KB</p>
          </div>
          {isUploading ? (
            <div className="text-sm font-mono-tabular font-semibold text-[var(--color-signal-clear-deep)] dark:text-[var(--color-signal-clear)]">
              {uploadProgress}%
            </div>
          ) : uploadProgress === 100 ? (
            <CheckCircle2 size={22} className="text-[var(--color-signal-clear)]" />
          ) : (
            <button
              onClick={onClear}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-current/10 transition-colors flex-shrink-0"
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {isUploading && (
          <div className="mt-4 h-1.5 w-full rounded-full bg-current/10 overflow-hidden">
            <motion.div
              className="h-full bg-[var(--color-signal-clear)] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={clsx(
          "rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-[var(--color-signal-clear)] bg-[var(--color-signal-clear)]/8"
            : "border-current/20 hover:border-current/35 hover:bg-current/[0.02]"
        )}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={isDragActive ? { y: [-2, 2, -2] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
          className="h-14 w-14 rounded-2xl bg-current/8 mx-auto mb-4 flex items-center justify-center"
        >
          <UploadCloud size={26} className="opacity-60" />
        </motion.div>
        <p className="font-semibold mb-1">
          {isDragActive ? "Drop it right here" : "Drag and drop your resume"}
        </p>
        <p className="text-sm opacity-55">or click to browse — PDF or DOCX, up to 10MB</p>
      </div>

      <AnimatePresence>
        {rejectionError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-[var(--color-signal-gap-deep)] dark:text-[var(--color-signal-gap)] mt-3 text-center"
          >
            {rejectionError}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
