import React, { useEffect, useState } from 'react';
import { Folder, ChevronRight, ChevronDown, FileCode2, Copy, Eye, Code, ExternalLink } from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import ts from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { getLanguageFromFileName } from './utils';

interface FileStructure {
  name: string;
  type: 'file' | 'folder';
  children?: FileStructure[];
  contentUrl?: string;
}

const projectStructure: FileStructure = {
  name: 'app',
  type: 'folder',
  children: [
    {
      name: 'example-one',
      type: 'folder',
      children: [
        {
          name: '_upload-providers',
          type: 'folder',
          children: [
            {
              name: 'CustomDataUploadService.ts',
              type: 'file',
              contentUrl:
                'https://raw.githubusercontent.com/giglabo/file-uploader/refs/heads/master/apps/demo-nextjs/src/app/%5Blocale%5D/example-one/_upload-providers/CustomDataUploadService.ts',
            },
            {
              name: 'CustomMetaUploadService.ts',
              type: 'file',
              contentUrl: 'https://raw.githubusercontent.com/giglabo/file-uploader/refs/heads/master/apps/demo-nextjs/src/app/%5Blocale%5D/example-one/_upload-providers/CustomMetaUploadService.ts',
            },
            {
              name: 'CustomUploadConfigService.ts',
              type: 'file',
              contentUrl: 'https://raw.githubusercontent.com/giglabo/file-uploader/refs/heads/master/apps/demo-nextjs/src/app/%5Blocale%5D/example-one/_upload-providers/CustomUploadConfigService.ts',
            },
          ],
        },
        {
          name: 'FilesList.tsx',
          type: 'file',
          contentUrl: 'https://raw.githubusercontent.com/giglabo/file-uploader/refs/heads/master/apps/demo-nextjs/src/app/%5Blocale%5D/example-one/FilesList.tsx',
        },
        {
          name: 'FileUploaderWrapper.tsx',
          type: 'file',
          contentUrl: 'https://raw.githubusercontent.com/giglabo/file-uploader/refs/heads/master/apps/demo-nextjs/src/app/%5Blocale%5D/example-one/FileUploaderWrapper.tsx',
        },
        {
          name: 'FileUploadProgress.tsx',
          type: 'file',
          contentUrl: 'https://raw.githubusercontent.com/giglabo/file-uploader/refs/heads/master/apps/demo-nextjs/src/app/%5Blocale%5D/example-one/FileUploadProgress.tsx',
        },
        {
          name: 'hashing-worker.worker.ts',
          type: 'file',
          contentUrl: 'https://raw.githubusercontent.com/giglabo/file-uploader/refs/heads/master/apps/demo-nextjs/src/app/%5Blocale%5D/example-one/hashing-worker.worker.ts',
        },
        {
          name: 'page.tsx',
          type: 'file',
          contentUrl: 'https://raw.githubusercontent.com/giglabo/file-uploader/refs/heads/master/apps/demo-nextjs/src/app/%5Blocale%5D/example-one/page.tsx',
        },
        {
          name: 'utils.ts',
          type: 'file',
          contentUrl: 'https://raw.githubusercontent.com/giglabo/file-uploader/refs/heads/master/apps/demo-nextjs/src/app/%5Blocale%5D/example-one/utils.ts',
        },
      ],
    },
  ],
};

const findFileByName = (structure: FileStructure, fileName: string): FileStructure | null => {
  if (structure.name === fileName && structure.type === 'file') {
    return structure;
  }
  if (structure.children) {
    for (const child of structure.children) {
      const found = findFileByName(child, fileName);
      if (found) return found;
    }
  }
  return null;
};

const FileTreeItem: React.FC<{
  item: FileStructure;
  depth?: number;
  onSelect: (item: FileStructure) => void;
  selectedFile?: FileStructure | null;
  defaultOpen?: boolean;
}> = ({ item, depth = 0.5, onSelect, selectedFile, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isSelected = selectedFile?.name === item.name && selectedFile?.type === 'file';

  const handleClick = () => {
    if (item.type === 'folder') {
      setIsOpen(!isOpen);
    } else {
      onSelect(item);
    }
  };

  return (
    <div>
      <div
        className={`flex cursor-pointer items-center px-2 py-1.5 hover:bg-gray-100 ${isSelected ? 'bg-orange-50' : ''}`}
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={handleClick}
      >
        {item.type === 'folder' ? (
          <>
            {isOpen ? <ChevronDown className="mr-1 h-4 w-4 text-gray-500" /> : <ChevronRight className="mr-1 h-4 w-4 text-gray-500" />}
            <Folder className="mr-2 h-4 w-4 text-blue-500" />
          </>
        ) : (
          <div className="flex items-center">
            <FileCode2 className="ml-5 mr-2 h-4 w-4 text-orange-500" />
          </div>
        )}
        <span className={`text-sm ${isSelected ? 'font-medium text-orange-900' : 'text-gray-700'}`}>{item.name}</span>
      </div>

      {item.type === 'folder' && isOpen && item.children && (
        <div>
          {item.children.map((child, index) => (
            <FileTreeItem
              key={index}
              item={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedFile={selectedFile}
              defaultOpen={defaultOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CodeTabProps {
  exampleOneUrl: string;
}

export default function CodeTab({ exampleOneUrl }: CodeTabProps) {
  const [selectedFile, setSelectedFile] = useState<FileStructure | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  SyntaxHighlighter.registerLanguage('javascript', js);
  SyntaxHighlighter.registerLanguage('typescript', ts);
  SyntaxHighlighter.registerLanguage('css', css);
  SyntaxHighlighter.registerLanguage('xml', xml);
  SyntaxHighlighter.registerLanguage('json', json);

  useEffect(() => {
    const pageFile = findFileByName(projectStructure, 'page.tsx');
    if (pageFile) {
      setSelectedFile(pageFile);
    }
  }, []);

  useEffect(() => {
    if (!selectedFile?.contentUrl) {
      setFileContent('');
      setIsLoading(false);
      setError(null);
      return;
    }
    const url = selectedFile.contentUrl;
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch file content: ${response.statusText}`);
        }

        const content = await response.text();
        if (isMounted) {
          setFileContent(content);
        }
      } catch (err) {
        console.error('Error fetching file content:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch file content');
          setFileContent('');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [selectedFile]);

  const handleCopyCode = async () => {
    if (selectedFile?.contentUrl && fileContent) {
      try {
        await navigator.clipboard.writeText(fileContent);
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg lg:col-span-2">
      <div className="flex h-[800px]">
        <div className="w-64 overflow-y-auto border-r border-gray-200 bg-gray-50">
          <div className="flex flex-row justify-between border-b border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700">Project Structure</h3>
            <a
              href={exampleOneUrl}
              target={'_blank'}
              className="inline-flex items-center font-medium text-orange-600 hover:text-orange-700"
              rel="noreferrer"
              title="Preview"
            >
              <Eye className="mr-1 h-5 w-5" />
            </a>
          </div>
          <div className="py-2">
            <FileTreeItem item={projectStructure} onSelect={setSelectedFile} selectedFile={selectedFile} defaultOpen={true} />
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          {selectedFile ? (
            <>
              <div className="flex items-center justify-between border-b border-gray-200 p-3">
                <h3 className="text-sm font-medium text-gray-700">{selectedFile.name}</h3>
                <button
                  onClick={handleCopyCode}
                  className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  disabled={!fileContent}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <pre className="flex-1 overflow-auto bg-gray-50 p-4 text-sm">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">Loading...</div>
                ) : error ? (
                  <div className="flex h-full items-center justify-center text-red-500">Error loading file: {error}</div>
                ) : (
                  <SyntaxHighlighter
                    language={getLanguageFromFileName(selectedFile.name)}
                    style={github}
                    customStyle={{ margin: 0, padding: '1rem', height: '100%', fontSize: '0.875rem' }}
                    showLineNumbers={true}
                  >
                    {fileContent}
                  </SyntaxHighlighter>
                )}
              </pre>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">Select a file to view its contents</div>
          )}
        </div>
      </div>
    </section>
  );
}
