import { useEffect, useState, useRef } from "react";
import { api } from "../../../lib/api";

interface Documento {
  id: string;
  nomeOriginal: string;
  nomeArquivo: string;
  mimeType: string;
  tamanho: number;
  origem: string;
  flagDecisao: string;
  descricao: string | null;
  dataDocumento: string;
  criadoEm: string;
}

const origemLabels: Record<string, string> = {
  PARTE_AUTORA: "Parte Autora",
  PARTE_RE: "Parte Ré",
  JUDICIARIO: "Judiciário",
  MINISTERIO_PUBLICO: "Ministério Público",
  PERITO: "Perito",
  OUTRO: "Outro",
};

const origemColors: Record<string, string> = {
  PARTE_AUTORA: "bg-blue-100 text-blue-700",
  PARTE_RE: "bg-red-100 text-red-700",
  JUDICIARIO: "bg-purple-100 text-purple-700",
  MINISTERIO_PUBLICO: "bg-amber-100 text-amber-700",
  PERITO: "bg-teal-100 text-teal-700",
  OUTRO: "bg-gray-100 text-gray-600",
};

const flagLabels: Record<string, string> = {
  NENHUMA: "Sem flag",
  DEFERIDA: "Deferida",
  INDEFERIDA: "Indeferida",
  PARCIALMENTE_DEFERIDA: "Parcialmente Deferida",
  SENTENCA: "Sentença",
  ACORDAO: "Acórdão",
  DESPACHO: "Despacho",
};

const flagColors: Record<string, string> = {
  NENHUMA: "",
  DEFERIDA: "bg-green-100 text-green-700 border border-green-300",
  INDEFERIDA: "bg-red-100 text-red-700 border border-red-300",
  PARCIALMENTE_DEFERIDA: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  SENTENCA: "bg-indigo-100 text-indigo-700 border border-indigo-300",
  ACORDAO: "bg-violet-100 text-violet-700 border border-violet-300",
  DESPACHO: "bg-sky-100 text-sky-700 border border-sky-300",
};

const origemOptions = [
  { value: "", label: "Todas as origens" },
  { value: "PARTE_AUTORA", label: "Parte Autora" },
  { value: "PARTE_RE", label: "Parte Ré" },
  { value: "JUDICIARIO", label: "Judiciário" },
  { value: "MINISTERIO_PUBLICO", label: "Ministério Público" },
  { value: "PERITO", label: "Perito" },
  { value: "OUTRO", label: "Outro" },
];

const flagOptions = [
  { value: "", label: "Todas as flags" },
  { value: "NENHUMA", label: "Sem flag" },
  { value: "DEFERIDA", label: "Deferida" },
  { value: "INDEFERIDA", label: "Indeferida" },
  { value: "PARCIALMENTE_DEFERIDA", label: "Parcialmente Deferida" },
  { value: "SENTENCA", label: "Sentença" },
  { value: "ACORDAO", label: "Acórdão" },
  { value: "DESPACHO", label: "Despacho" },
];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(val: string) {
  return new Date(val).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function TabDocumentos({ processoId }: { processoId: string }) {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filtroOrigem, setFiltroOrigem] = useState("");
  const [filtroFlag, setFiltroFlag] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadForm, setUploadForm] = useState({
    origem: "OUTRO",
    flagDecisao: "NENHUMA",
    descricao: "",
    dataDocumento: new Date().toISOString().split("T")[0]!,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ origem: "", flagDecisao: "", descricao: "" });

  const carregar = () => {
    setLoading(true);
    api
      .get(`/processos/${processoId}/documentos`, {
        params: {
          origem: filtroOrigem || undefined,
          flagDecisao: filtroFlag || undefined,
        },
      })
      .then((res) => setDocumentos(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, [processoId, filtroOrigem, filtroFlag]);

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("arquivo", file);
    formData.append("origem", uploadForm.origem);
    formData.append("flagDecisao", uploadForm.flagDecisao);
    formData.append("descricao", uploadForm.descricao);
    formData.append("dataDocumento", uploadForm.dataDocumento);

    try {
      await api.post(`/processos/${processoId}/documentos`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowUploadForm(false);
      setUploadForm({ origem: "OUTRO", flagDecisao: "NENHUMA", descricao: "", dataDocumento: new Date().toISOString().split("T")[0]! });
      if (fileInputRef.current) fileInputRef.current.value = "";
      carregar();
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: Documento) => {
    try {
      const response = await api.get(
        `/processos/${processoId}/documentos/${doc.id}/download`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: doc.mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.nomeOriginal;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Erro ao baixar o documento");
    }
  };

  const startEdit = (doc: Documento) => {
    setEditingId(doc.id);
    setEditForm({
      origem: doc.origem,
      flagDecisao: doc.flagDecisao,
      descricao: doc.descricao || "",
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await api.put(`/processos/${processoId}/documentos/${editingId}`, editForm);
    setEditingId(null);
    carregar();
  };

  const excluir = async (doc: Documento) => {
    if (!confirm(`Excluir "${doc.nomeOriginal}"?`)) return;
    await api.delete(`/processos/${processoId}/documentos/${doc.id}`);
    carregar();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Cópia Integral ({documentos.length} documento{documentos.length !== 1 ? "s" : ""})
        </h3>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          {showUploadForm ? "Cancelar" : "+ Upload de Documento"}
        </button>
      </div>

      {showUploadForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-medium text-gray-800 mb-4">Enviar Documento</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arquivo <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data do Documento</label>
              <input
                type="date"
                value={uploadForm.dataDocumento}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, dataDocumento: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origem / Peticionante</label>
              <select
                value={uploadForm.origem}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, origem: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              >
                {origemOptions.slice(1).map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Flag de Decisão</label>
              <select
                value={uploadForm.flagDecisao}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, flagDecisao: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              >
                {flagOptions.slice(1).map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input
                type="text"
                value={uploadForm.descricao}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, descricao: e.target.value }))}
                placeholder="Ex: Petição inicial, Contestação, Sentença..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              {uploading ? "Enviando..." : "Enviar Documento"}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={filtroOrigem}
          onChange={(e) => setFiltroOrigem(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          {origemOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={filtroFlag}
          onChange={(e) => setFiltroFlag(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          {flagOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : documentos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">
          Nenhum documento encontrado
        </div>
      ) : (
        <div className="space-y-3">
          {documentos.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg shadow p-4">
              {editingId === doc.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={editForm.origem}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, origem: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      {origemOptions.slice(1).map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <select
                      value={editForm.flagDecisao}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, flagDecisao: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      {flagOptions.slice(1).map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={editForm.descricao}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descrição..."
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors">
                      Salvar
                    </button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                      {doc.mimeType.includes("pdf") ? "📄" : doc.mimeType.includes("image") ? "🖼️" : "📎"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {doc.descricao || doc.nomeOriginal}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${origemColors[doc.origem] || ""}`}>
                          {origemLabels[doc.origem] || doc.origem}
                        </span>
                        {doc.flagDecisao !== "NENHUMA" && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${flagColors[doc.flagDecisao] || ""}`}>
                            {flagLabels[doc.flagDecisao] || doc.flagDecisao}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{formatDate(doc.dataDocumento)}</span>
                        <span>{formatSize(doc.tamanho)}</span>
                        {doc.descricao && (
                          <span className="truncate">{doc.nomeOriginal}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => startEdit(doc)}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => excluir(doc)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
