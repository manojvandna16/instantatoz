import { decode } from "base64-arraybuffer";

export async function uploadWorkerPhoto(_uri: string, _fileName: string): Promise<string> {
  throw new Error('Supabase storage is deprecated. Use Firebase Storage via getWorkerPhotoUploadUrl function.');
}
