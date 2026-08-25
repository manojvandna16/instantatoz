import { createClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";

const SUPABASE_URL = "https://yxoqifqxjhlodqncpqtb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_b01IdMCQI9RcEVHivVt9xA_uG7iBgo2";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
  },
});

/**
 * Upload profile photo/dossier to Supabase Storage Bucket
 * @param base64Str Base64 image data from ImagePicker
 * @param fileName Target filename
 * @returns Public URL of the uploaded image
 */
export async function uploadWorkerPhoto(base64Str: string, fileName: string): Promise<string> {
  const filePath = `worker-docs/${Date.now()}_${fileName}`;
  
  // Upload base64 converted to ArrayBuffer
  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(filePath, decode(base64Str), {
      contentType: "image/jpeg",
      upsert: true
    });

  if (error) {
    throw new Error("Failed to upload image to Supabase: " + error.message);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}
