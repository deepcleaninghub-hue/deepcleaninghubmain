import { httpClient } from './httpClient';

export interface InquiryService {
  id: string;
  name: string;
  price: string;
}

export interface InquiryData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  services: InquiryService[];
  message?: string;
  preferredDate?: string | undefined;
  serviceArea?: string;
}

export interface InquiryResponse {
  success: boolean;
  message: string;
  data?: {
    inquiryId: string;
    status: string;
  };
  error?: string;
}

class InquiriesAPI {
  private baseUrl = '/inquiries';

  // Submit a new inquiry
  async submitInquiry(inquiryData: InquiryData): Promise<InquiryResponse> {
    try {
      const response = await httpClient.post<InquiryResponse>(this.baseUrl, inquiryData);
      return response;
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      throw error;
    }
  }
}

export const inquiriesAPI = new InquiriesAPI();
