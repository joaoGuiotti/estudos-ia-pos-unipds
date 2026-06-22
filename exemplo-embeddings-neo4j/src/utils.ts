import { Document } from "@langchain/core/documents";

export class Utils {
    public static formatContent(text: string): string {
        return text
            .replace(/\s+/g, ' ')
            .trim();
    }

    public static displayResults(results: Array<Document<Record<string, any>>>): void {
        console.log(`\n📄 Encontrados ${results.length} trechos relevantes:\n`);

        results.forEach((doc, index) => {
            console.log(`   ${index + 1}.`);
            console.log(`      ${this.formatContent(doc.pageContent)}`);
            if (doc.metadata?.pageNumber) {
                console.log(`      📄 (Página: ${doc.metadata.pageNumber})`);
            }
            console.log();
        });
    }

    public static printDivider(): void {
        console.log(`${'='.repeat(80)}`);
    }
}