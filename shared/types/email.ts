// shared/types/email.ts

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MailingList {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  subscriberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MailingCampaign {
  id: number;
  name: string;
  subject: string;
  templateId?: number;
  mailingListId?: number;
  status: string;
  scheduledAt?: Date;
  sentAt?: Date;
  recipientCount: number;
  openCount: number;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MailingListRecipient {
  id: number;
  mailingListId?: number;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

export interface MailingListSubscription {
  id: number;
  email: string;
  mailingListId?: number;
  status: string;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  confirmationToken?: string;
  confirmedAt?: Date;
}

// Request Types
export interface CreateEmailTemplateRequest {
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables?: string[];
  isActive?: boolean;
}

export interface UpdateEmailTemplateRequest extends Partial<CreateEmailTemplateRequest> {
  id: number;
}

export interface CreateMailingListRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateMailingListRequest extends Partial<CreateMailingListRequest> {
  id: number;
}

export interface CreateMailingCampaignRequest {
  name: string;
  subject: string;
  templateId?: number;
  mailingListId?: number;
  status?: string;
  scheduledAt?: Date;
}

export interface UpdateMailingCampaignRequest extends Partial<CreateMailingCampaignRequest> {
  id: number;
}

export interface CreateMailingListRecipientRequest {
  mailingListId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface UpdateMailingListRecipientRequest extends Partial<CreateMailingListRecipientRequest> {
  id: number;
}

export interface CreateMailingListSubscriptionRequest {
  email: string;
  mailingListId: number;
  status?: string;
  confirmationToken?: string;
}

export interface UpdateMailingListSubscriptionRequest extends Partial<CreateMailingListSubscriptionRequest> {
  id: number;
}

// Response Types
export interface EmailTemplateResponse {
  success: boolean;
  data?: EmailTemplate;
  message?: string;
}

export interface EmailTemplatesResponse {
  success: boolean;
  data?: EmailTemplate[];
  message?: string;
}

export interface MailingListResponse {
  success: boolean;
  data?: MailingList;
  message?: string;
}

export interface MailingListsResponse {
  success: boolean;
  data?: MailingList[];
  message?: string;
}

export interface MailingCampaignResponse {
  success: boolean;
  data?: MailingCampaign;
  message?: string;
}

export interface MailingCampaignsResponse {
  success: boolean;
  data?: MailingCampaign[];
  message?: string;
}

export interface MailingListRecipientsResponse {
  success: boolean;
  data?: MailingListRecipient[];
  message?: string;
}

export interface MailingListSubscriptionsResponse {
  success: boolean;
  data?: MailingListSubscription[];
  message?: string;
}

// Email Campaign Statistics
export interface CampaignStats {
  campaignId: number;
  recipientCount: number;
  openCount: number;
  clickCount: number;
  openRate: number;
  clickRate: number;
  bounceCount: number;
  bounceRate: number;
}

export interface EmailMetrics {
  totalCampaigns: number;
  totalRecipients: number;
  averageOpenRate: number;
  averageClickRate: number;
  totalBounces: number;
}