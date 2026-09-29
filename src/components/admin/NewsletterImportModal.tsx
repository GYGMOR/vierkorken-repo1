'use client';

import { useState } from 'react';

interface NewsletterImportModalProps {
  onClose: () => void;
  onImported: () => void;
}

interface ImportEntry {
  email: string;
  firstName: string;
  lastName: string;
}

interface ImportResult {
  added: string[];
  alreadySubscribed: string[];
  hasAccount: string[];
  unsubscribed: string[];
  invalid: string[];
  duplicateInFile: string[];
}

// Example row in the templates – ignored when importing
const TEMPLATE_EXAMPLE_EMAIL = 'max.muster@example.com';
const TEMPLATE_HEADERS = ['E-Mail', 'Vorname', 'Nachname'];
const TEMPLATE_EXAMPLE_ROW = [TEMPLATE_EXAMPLE_EMAIL, 'Max', 'Muster'];

export function NewsletterImportModal({ onClose, onImported }: NewsletterImportModalProps) {
  // Manual entry
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // File import
  const [fileName, setFileName] = useState('');
  const [fileEntries, setFileEntries] = useState<ImportEntry[]>([]);
  const [fileError, setFileError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const submitEntries = async (entries: ImportEntry[], source: 'admin-manual' | 'admin-import') => {
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/newsletter/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries, source }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(`❌ Fehler: ${data.error || 'Import fehlgeschlagen'}`);
        return false;
      }
      setResult(data);
      if (data.added.length > 0) onImported();
      return true;
    } catch (error: any) {
      alert(`❌ Fehler: ${error.message}`);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const ok = await submitEntries([{ email: email.trim(), firstName: firstName.trim(), lastName: lastName.trim() }], 'admin-manual');
    if (ok) {
      setEmail('');
      setFirstName('');
      setLastName('');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setResult(null);
    setFileError('');
    setFileName(file.name);
    try {
      const entries = await parseImportFile(file);
      setFileEntries(entries);
      if (entries.length === 0) {
        setFileError('In der Datei wurden keine E-Mail-Adressen gefunden. Bitte die Vorlage verwenden.');
      }
    } catch (error) {
      console.error('Error reading import file:', error);
      setFileEntries([]);
      setFileError('Die Datei konnte nicht gelesen werden. Bitte als .xlsx oder .csv speichern.');
    }
  };

  const handleFileImport = async () => {
    if (fileEntries.length === 0) return;
    if (!confirm(`${fileEntries.length} Adresse(n) als Newsletter-Abonnenten importieren?`)) return;
    const ok = await submitEntries(fileEntries, 'admin-import');
    if (ok) {
      setFileEntries([]);
      setFileName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-light text-graphite-dark">
              Newsletter-Abonnenten importieren
            </h2>
            <p className="text-sm text-graphite/70">
              Adressen werden als &quot;Nur Newsletter&quot; gespeichert – ohne Kundenkonto.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-graphite hover:text-graphite-dark transition-colors"
            aria-label="Schliessen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-xs text-graphite/70 bg-warmwhite border border-taupe-light rounded-lg p-3">
            Bitte nur Adressen erfassen, die dem Erhalt des Newsletters zugestimmt haben. Beim Import wird keine
            Bestätigungs-Mail versendet. Adressen, die sich früher abgemeldet haben, werden nicht erneut eingetragen.
          </p>

          {/* Manual entry */}
          <section className="space-y-3">
            <h3 className="text-lg font-serif text-graphite-dark">E-Mail-Adresse von Hand eintragen</h3>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-Mail-Adresse *"
                required
                className="w-full px-4 py-2.5 border border-taupe rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-burgundy text-sm"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Vorname (optional)"
                  className="w-full px-4 py-2.5 border border-taupe rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-burgundy text-sm"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nachname (optional)"
                  className="w-full px-4 py-2.5 border border-taupe rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-burgundy text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="w-full sm:w-auto px-5 py-2.5 bg-accent-burgundy hover:bg-wine-dark text-white text-sm font-medium rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Wird übermittelt...' : 'Übermitteln'}
              </button>
            </form>
          </section>

          {/* File import */}
          <section className="space-y-3 pt-6 border-t border-taupe-light/60">
            <h3 className="text-lg font-serif text-graphite-dark">Viele Adressen importieren (Excel / CSV)</h3>

            <div className="space-y-2">
              <p className="text-sm text-graphite">
                <span className="font-semibold">1.</span> Vorlage herunterladen und ausfüllen (eine Adresse pro Zeile, Vorname und Nachname sind optional):
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={downloadExcelTemplate}
                  className="px-4 py-2 bg-white hover:bg-taupe-light/30 text-accent-burgundy border border-accent-burgundy/30 text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <DownloadIcon />
                  Excel-Vorlage (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={downloadCsvTemplate}
                  className="px-4 py-2 bg-white hover:bg-taupe-light/30 text-accent-burgundy border border-accent-burgundy/30 text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <DownloadIcon />
                  CSV-Vorlage (.csv)
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-graphite">
                <span className="font-semibold">2.</span> Ausgefüllte Datei auswählen (.xlsx oder .csv):
              </p>
              <label className="cursor-pointer block">
                <div className="border-2 border-dashed border-taupe-light rounded-xl p-5 text-center hover:border-accent-burgundy hover:bg-accent-burgundy/5 transition-all">
                  <p className="text-sm font-medium text-graphite-dark">
                    {fileName || 'Datei auswählen'}
                  </p>
                  <p className="text-xs text-graphite/60 mt-1">Excel (.xlsx) oder CSV (.csv)</p>
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={submitting}
                />
              </label>
              {fileError && <p className="text-sm text-red-700">{fileError}</p>}
            </div>

            {fileEntries.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-graphite">
                  <span className="font-semibold">3.</span> {fileEntries.length} Adresse(n) erkannt. Vorschau:
                </p>
                <div className="border border-taupe-light rounded-lg overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-taupe-light/50 text-graphite/60 uppercase tracking-wider">
                        <th className="py-2 px-3">E-Mail</th>
                        <th className="py-2 px-3">Vorname</th>
                        <th className="py-2 px-3">Nachname</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-taupe-light/30">
                      {fileEntries.slice(0, 5).map((entry, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3 text-graphite-dark">{entry.email}</td>
                          <td className="py-2 px-3 text-graphite">{entry.firstName || '–'}</td>
                          <td className="py-2 px-3 text-graphite">{entry.lastName || '–'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {fileEntries.length > 5 && (
                    <p className="text-xs text-graphite/60 px-3 py-2 border-t border-taupe-light/30">
                      … und {fileEntries.length - 5} weitere
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleFileImport}
                  disabled={submitting}
                  className="w-full sm:w-auto px-5 py-2.5 bg-accent-burgundy hover:bg-wine-dark text-white text-sm font-medium rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Wird importiert...' : `${fileEntries.length} Adresse(n) importieren`}
                </button>
              </div>
            )}
          </section>

          {result && <ImportResultSummary result={result} />}
        </div>
      </div>
    </div>
  );
}

function ImportResultSummary({ result }: { result: ImportResult }) {
  const skipped = [
    { label: 'waren bereits im Newsletter eingetragen', emails: result.alreadySubscribed },
    { label: 'haben bereits ein Kundenkonto (Newsletter-Einstellung im Konto)', emails: result.hasAccount },
    { label: 'haben sich früher abgemeldet und wurden nicht erneut eingetragen', emails: result.unsubscribed },
    { label: 'sind ungültige E-Mail-Adressen', emails: result.invalid },
    { label: 'kamen in der Datei doppelt vor', emails: result.duplicateInFile },
  ].filter(group => group.emails.length > 0);

  return (
    <div className="space-y-2 pt-6 border-t border-taupe-light/60" aria-live="polite">
      <div
        className={`text-sm font-medium rounded-lg p-3 border ${
          result.added.length > 0
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-warmwhite text-graphite-dark border-taupe-light'
        }`}
      >
        {result.added.length > 0
          ? `✅ ${result.added.length} Adresse(n) neu als Newsletter-Abonnent eingetragen.`
          : 'Es wurde keine neue Adresse eingetragen.'}
      </div>
      {skipped.map(group => (
        <details key={group.label} className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900">
          <summary className="cursor-pointer">
            {group.emails.length} {group.label}
          </summary>
          <ul className="mt-2 text-xs space-y-0.5 max-h-40 overflow-y-auto">
            {group.emails.map(email => (
              <li key={email}>{email}</li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

// ---------- Templates ----------

async function downloadExcelTemplate() {
  const XLSX = await import('xlsx');
  const sheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, TEMPLATE_EXAMPLE_ROW]);
  sheet['!cols'] = [{ wch: 36 }, { wch: 20 }, { wch: 20 }];

  const instructions = XLSX.utils.aoa_to_sheet([
    ['Anleitung Newsletter-Import'],
    [''],
    ['1. Im Blatt "Newsletter" pro Zeile eine E-Mail-Adresse eintragen.'],
    ['2. Vorname und Nachname sind optional.'],
    [`3. Die Beispielzeile (${TEMPLATE_EXAMPLE_EMAIL}) wird beim Import ignoriert und kann stehen bleiben.`],
    ['4. Datei speichern und im Admin-Panel unter Benutzer → Import hochladen (.xlsx oder .csv).'],
  ]);
  instructions['!cols'] = [{ wch: 90 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Newsletter');
  XLSX.utils.book_append_sheet(workbook, instructions, 'Anleitung');
  XLSX.writeFile(workbook, 'vierkorken_newsletter_import_vorlage.xlsx');
}

function downloadCsvTemplate() {
  // Semicolon + BOM so Excel (CH/DE) opens it directly in columns with correct umlauts
  const csv = '﻿' + [TEMPLATE_HEADERS, TEMPLATE_EXAMPLE_ROW].map(row => row.join(';')).join('\r\n') + '\r\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'vierkorken_newsletter_import_vorlage.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---------- File parsing ----------

async function parseImportFile(file: File): Promise<ImportEntry[]> {
  const buffer = await file.arrayBuffer();
  let rows: string[][];

  if (/\.xlsx?$/i.test(file.name)) {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, defval: '' });
  } else {
    rows = parseCsv(decodeText(buffer));
  }

  return rowsToEntries(rows);
}

// Excel saves "CSV UTF-8" or "CSV (Trennzeichen-getrennt)" in Windows-1252
function decodeText(buffer: ArrayBuffer): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder('windows-1252').decode(buffer);
  }
}

function parseCsv(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const delimiter = [';', ',', '\t'].reduce(
    (best, d) => (firstLine.split(d).length > firstLine.split(best).length ? d : best),
    ';'
  );

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function rowsToEntries(rows: string[][]): ImportEntry[] {
  const cleanRows = rows
    .map(r => r.map(c => String(c ?? '').trim()))
    .filter(r => r.some(c => c));
  if (cleanRows.length === 0) return [];

  const isEmailHeader = (c: string) => /^e-?mail/i.test(c) && !c.includes('@');
  const headerIndex = cleanRows.slice(0, 5).findIndex(r => r.some(isEmailHeader));

  let emailCol: number;
  let firstNameCol: number;
  let lastNameCol: number;
  let dataRows: string[][];

  if (headerIndex !== -1) {
    const header = cleanRows[headerIndex].map(c => c.toLowerCase());
    emailCol = header.findIndex(isEmailHeader);
    firstNameCol = header.findIndex(c => /vorname|first/.test(c));
    lastNameCol = header.findIndex(c => /nachname|last|^name$/.test(c));
    dataRows = cleanRows.slice(headerIndex + 1);
  } else {
    // No header: use the column containing the first "@"
    emailCol = Math.max(0, cleanRows[0].findIndex(c => c.includes('@')));
    firstNameCol = emailCol === 0 ? 1 : -1;
    lastNameCol = emailCol === 0 ? 2 : -1;
    dataRows = cleanRows;
  }

  return dataRows
    .map(r => ({
      email: r[emailCol] || '',
      firstName: firstNameCol >= 0 ? r[firstNameCol] || '' : '',
      lastName: lastNameCol >= 0 ? r[lastNameCol] || '' : '',
    }))
    .filter(entry => entry.email && entry.email.toLowerCase() !== TEMPLATE_EXAMPLE_EMAIL);
}
