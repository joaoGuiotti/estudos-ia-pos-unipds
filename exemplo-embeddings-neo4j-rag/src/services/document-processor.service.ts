import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { type TextSplitterConfig } from '../core/config.ts';

export class DocumentProcessorService {
    private pdfPath!: string;
    private textSplitter!: TextSplitterConfig;

    private constructor(
        pdfPath: string,
        textSplitter: TextSplitterConfig,
    ) {
        this.pdfPath = pdfPath;
        this.textSplitter = textSplitter;
    }

    async loadAndSplitDocument() {
        const laoder = new PDFLoader(this.pdfPath);
        const rawDocuments = await laoder.load();
        console.log(` 📄 Loaded ${rawDocuments.length} pages from the PDF. \n path: ${this.pdfPath}\n`);

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: this.textSplitter.chunkSize,
            chunkOverlap: this.textSplitter.chunkOverlap,
        });


        const documentsChunks = await splitter.splitDocuments(rawDocuments);
        console.log(' ✂️  Split ', documentsChunks.length, ' chunks from the PDF.\n chunk size: ', this.textSplitter.chunkSize, '\n chunk overlap: ', this.textSplitter.chunkOverlap, '\n');

        return documentsChunks.map((chunk) => ({
            ...chunk,
            metadata: {
                source: chunk.metadata.source,
            }
        }));
    }


    static create(pdfPath: string, textSplitter: TextSplitterConfig) {
        return new DocumentProcessorService(pdfPath, textSplitter);
    }
}