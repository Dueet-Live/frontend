// Error response after extracting useful attributes
export interface ApiErrorResponse {
  code: number;
  body?: any & {
    error?: string;
  };
}
