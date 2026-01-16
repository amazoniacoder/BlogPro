// client/src/services/api/email.ts
import { httpClient } from '../cache/http-client';
import type {
  EmailTemplate,
  MailingList,
  MailingCampaign,
  MailingListRecipient,
  MailingListSubscription,
  CreateEmailTemplateRequest,
  UpdateEmailTemplateRequest,
  CreateMailingListRequest,
  UpdateMailingListRequest,
  CreateMailingCampaignRequest,
  UpdateMailingCampaignRequest,
  CreateMailingListRecipientRequest,
  UpdateMailingListRecipientRequest,
  CreateMailingListSubscriptionRequest,
  CampaignStats,
  EmailMetrics
} from '../../../../shared/types/email';

const API_BASE = '/api/mailings';

export const emailService = {
  // Email Templates
  async getTemplates(): Promise<EmailTemplate[]> {
    const response = await httpClient.get<EmailTemplate[]>(`${API_BASE}/templates`);
    return response || [];
  },

  async getTemplate(id: number): Promise<EmailTemplate> {
    const response = await httpClient.get<EmailTemplate>(`${API_BASE}/templates/${id}`);
    if (!response) {
      throw new Error('Template not found');
    }
    return response;
  },

  async createTemplate(data: CreateEmailTemplateRequest): Promise<EmailTemplate> {
    const response = await httpClient.post<EmailTemplate>(`${API_BASE}/templates`, data);
    if (!response) {
      throw new Error('Failed to create template');
    }
    return response;
  },

  async updateTemplate(data: UpdateEmailTemplateRequest): Promise<EmailTemplate> {
    const response = await httpClient.put<EmailTemplate>(`${API_BASE}/templates/${data.id}`, data);
    if (!response) {
      throw new Error('Failed to update template');
    }
    return response;
  },

  async deleteTemplate(id: number): Promise<void> {
    await httpClient.delete(`${API_BASE}/templates/${id}`);
  },

  // Mailing Lists
  async getMailingLists(): Promise<MailingList[]> {
    const response = await httpClient.get<MailingList[]>(`${API_BASE}/lists`);
    return response || [];
  },

  async getMailingList(id: number): Promise<MailingList> {
    const response = await httpClient.get<MailingList>(`${API_BASE}/lists/${id}`);
    if (!response) {
      throw new Error('Mailing list not found');
    }
    return response;
  },

  async createMailingList(data: CreateMailingListRequest): Promise<MailingList> {
    const response = await httpClient.post<MailingList>(`${API_BASE}/lists`, data);
    if (!response) {
      throw new Error('Failed to create mailing list');
    }
    return response;
  },

  async updateMailingList(data: UpdateMailingListRequest): Promise<MailingList> {
    const response = await httpClient.put<MailingList>(`${API_BASE}/lists/${data.id}`, data);
    if (!response) {
      throw new Error('Failed to update mailing list');
    }
    return response;
  },

  async deleteMailingList(id: number): Promise<void> {
    await httpClient.delete(`${API_BASE}/lists/${id}`);
  },

  // Mailing Campaigns
  async getCampaigns(): Promise<MailingCampaign[]> {
    const response = await httpClient.get<MailingCampaign[]>(`${API_BASE}/campaigns`);
    return response || [];
  },

  async getCampaign(id: number): Promise<MailingCampaign> {
    const response = await httpClient.get<MailingCampaign>(`${API_BASE}/campaigns/${id}`);
    if (!response) {
      throw new Error('Campaign not found');
    }
    return response;
  },

  async createCampaign(data: CreateMailingCampaignRequest): Promise<MailingCampaign> {
    const response = await httpClient.post<MailingCampaign>(`${API_BASE}/campaigns`, data);
    if (!response) {
      throw new Error('Failed to create campaign');
    }
    return response;
  },

  async updateCampaign(data: UpdateMailingCampaignRequest): Promise<MailingCampaign> {
    const response = await httpClient.put<MailingCampaign>(`${API_BASE}/campaigns/${data.id}`, data);
    if (!response) {
      throw new Error('Failed to update campaign');
    }
    return response;
  },

  async deleteCampaign(id: number): Promise<void> {
    await httpClient.delete(`${API_BASE}/campaigns/${id}`);
  },

  async sendCampaign(id: number): Promise<void> {
    await httpClient.post(`${API_BASE}/campaigns/${id}/send`);
  },

  // Mailing List Recipients
  async getRecipients(mailingListId: number): Promise<MailingListRecipient[]> {
    const response = await httpClient.get<MailingListRecipient[]>(`${API_BASE}/lists/${mailingListId}/recipients`);
    return response || [];
  },

  async addRecipient(data: CreateMailingListRecipientRequest): Promise<MailingListRecipient> {
    const response = await httpClient.post<MailingListRecipient>(`${API_BASE}/lists/${data.mailingListId}/recipients`, data);
    return response;
  },

  async updateRecipient(data: UpdateMailingListRecipientRequest): Promise<MailingListRecipient> {
    const response = await httpClient.put<MailingListRecipient>(`${API_BASE}/recipients/${data.id}`, data);
    return response;
  },

  async removeRecipient(id: number): Promise<void> {
    await httpClient.delete(`${API_BASE}/recipients/${id}`);
  },

  // Subscriptions
  async getSubscriptions(mailingListId?: number): Promise<MailingListSubscription[]> {
    const url = mailingListId 
      ? `${API_BASE}/lists/${mailingListId}/subscriptions`
      : `${API_BASE}/subscriptions`;
    const response = await httpClient.get<MailingListSubscription[]>(url);
    return response || [];
  },

  async subscribe(data: CreateMailingListSubscriptionRequest): Promise<MailingListSubscription> {
    const response = await httpClient.post<MailingListSubscription>(`${API_BASE}/subscriptions`, data);
    return response;
  },

  async unsubscribe(id: number): Promise<void> {
    await httpClient.post(`${API_BASE}/subscriptions/${id}/unsubscribe`);
  },

  async confirmSubscription(token: string): Promise<void> {
    await httpClient.post(`${API_BASE}/subscriptions/confirm`, { token });
  },

  // Analytics
  async getCampaignStats(campaignId: number): Promise<CampaignStats> {
    const response = await httpClient.get<CampaignStats>(`${API_BASE}/campaigns/${campaignId}/stats`);
    return response;
  },

  async getEmailMetrics(): Promise<EmailMetrics> {
    const response = await httpClient.get<EmailMetrics>(`${API_BASE}/metrics`);
    return response;
  }
};
