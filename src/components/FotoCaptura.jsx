import { useRef } from 'react';
import { IconCamera, IconUpload } from '@tabler/icons-react';

// Converte File para base64 (sem prefixo data:...)
export async function fileParaBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function FotoCaptura({ onFoto, label = 'Tirar foto', aceitar = 'image/*', captura = 'environment' }) {
  const inputRef = useRef(null);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileParaBase64(file);
    const url = URL.createObjectURL(file);
    onFoto({ file, base64, url });
    e.target.value = '';
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={aceitar}
        capture={captura}
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1D24] border border-[#30353F] rounded-xl text-sm text-[#A8ADB8] hover:border-[#F08020] hover:text-[#F08020] transition-colors"
      >
        <IconCamera size={16} />
        {label}
      </button>
    </>
  );
}

export function FotoCapturaGaleria({ onFoto, label = 'Anexar foto' }) {
  const inputRef = useRef(null);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileParaBase64(file);
    const url = URL.createObjectURL(file);
    onFoto({ file, base64, url });
    e.target.value = '';
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-3 py-2 bg-[#1A1D24] border border-[#30353F] rounded-xl text-sm text-[#A8ADB8] hover:border-[#F08020] hover:text-[#F08020] transition-colors"
      >
        <IconUpload size={14} />
        {label}
      </button>
    </>
  );
}
