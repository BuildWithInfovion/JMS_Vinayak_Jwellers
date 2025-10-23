// frontend/src/components/common/Modal.jsx
import React from "react";

// Added maxWidth prop with a default value
const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;

  return (
    // Backdrop - Added class for print targeting
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4 modal-backdrop-print-visible" // Added class
      onClick={onClose}
    >
      {/* Modal Content */}
      {/* Apply dynamic maxWidth, max-h, and overflow styles */}
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} p-6 z-50 max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4 sticky top-0 bg-white z-10 print-hide">
          {" "}
          {/* Made header sticky & hide on print */}
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times; {/* HTML entity for 'X' */}
          </button>
        </div>
        {/* Body */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
