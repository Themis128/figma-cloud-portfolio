export interface OpenGraphData {
  title: string | null;
  description: string | null;
  image: string | null;
  url: string | null;
  type: string | null;
  siteName: string | null;
}

export interface TwitterCardData {
  card: string | null;
  title: string | null;
  description: string | null;
  image: string | null;
  site: string | null;
  creator: string | null;
}

export interface LinkPreviewData {
  url: string;
  title: string;
  description: string;
  image: string | null;
  favicon: string | null;
  siteName: string;
  type: string;
  openGraph: OpenGraphData | null;
  twitter: TwitterCardData | null;
  lastFetched: string;
  error: string | null;
}

export interface ContactFormRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ResumeData {
  [key: string]: unknown;
}

export interface APIKey {
  id: string;
  created_at: string;
  created_by: {
    id: string;
    type: string;
  };
  name: string;
  partial_key_hint: string;
  status: "active" | "inactive" | "archived";
  type: "api_key";
  workspace_id: string | null;
}

export interface UpdateAPIKeyRequest {
  name?: string;
  status?: "active" | "inactive" | "archived";
}

export interface CreateAPIKeyRequest {
  name: string;
  workspace_id?: string | null;
}
