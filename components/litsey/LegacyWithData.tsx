import { getOlympiadTables } from "@/lib/olympiadStats";
import Legacy from "./Legacy";

export default async function LegacyWithData() {
    const tables = await getOlympiadTables();

    return <Legacy tables={tables} />;
}
