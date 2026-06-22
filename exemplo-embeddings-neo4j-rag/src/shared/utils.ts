import { Document } from "@langchain/core/documents";

export class Utils {
    public static formatContent(text: string): string {
        return text
            .replace(/\s+/g, ' ')
            .trim();
    }

    public static displayResults(results: Array<Document<Record<string, any>>>): void {
        this.log(`\n📄 Encontrados ${results.length} trechos relevantes:\n`);

        results.forEach((doc, index) => {
            this.log(`   ${index + 1}.`);
            this.log(`      ${this.formatContent(doc.pageContent)}`);
            if (doc.metadata?.pageNumber) {
                this.log(`      📄 (Página: ${doc.metadata.pageNumber})`);
            }
            this.log();
        });
    }

    public static printDivider(): void {
        this.log(`${'='.repeat(80)}`);
    }

    public static log(...args: any[]): void {
        console.log(...args);
    }
}