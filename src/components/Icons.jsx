import React from 'react';
import {
    Download,
    Mail,
    Share2,
    Printer,
    Copy,
    Save,
    BarChart3,
    FileText,
    X,
    BrainCircuit
} from 'lucide-react';

export const DownloadIcon = ({ size = 18 }) => <Download size={size} />;
export const EmailIcon = ({ size = 18 }) => <Mail size={size} />;
export const ShareIcon = ({ size = 18 }) => <Share2 size={size} />;
export const PrintIcon = ({ size = 18 }) => <Printer size={size} />;
export const CopyIcon = ({ size = 18 }) => <Copy size={size} />;
export const SaveIcon = ({ size = 18 }) => <Save size={size} />;
export const ChartIcon = ({ size = 18 }) => <BarChart3 size={size} />;
export const FileIcon = ({ size = 18 }) => <FileText size={size} />;
export const CloseIcon = ({ size = 20 }) => <X size={size} />;
export const BrainIcon = ({ size = 18 }) => <BrainCircuit size={size} />;
