// client/src/hooks/useEmailSystem.ts
import { useState, useCallback } from 'react';
import { emailService } from '../services/api/email';
import type {
  EmailTemplate,
  MailingList,
  MailingCampaign,
  CreateEmailTemplateRequest,
  UpdateEmailTemplateRequest,
  CreateMailingListRequest,
  UpdateMailingListRequest,
  CreateMailingCampaignRequest,
  UpdateMailingCampaignRequest,
  CampaignStats,
  EmailMetrics
} from '../../../shared/types/email';

export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await emailService.getTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (data: CreateEmailTemplateRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const newTemplate = await emailService.createTemplate(data);
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(async (data: UpdateEmailTemplateRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedTemplate = await emailService.updateTemplate(data);
      setTemplates(prev => prev.map(t => t.id === data.id ? updatedTemplate : t));
      return updatedTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTemplate = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await emailService.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
};

export const useMailingLists = () => {
  const [mailingLists, setMailingLists] = useState<MailingList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMailingLists = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await emailService.getMailingLists();
      setMailingLists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mailing lists');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMailingList = useCallback(async (data: CreateMailingListRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const newList = await emailService.createMailingList(data);
      setMailingLists(prev => [...prev, newList]);
      return newList;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create mailing list');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateMailingList = useCallback(async (data: UpdateMailingListRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedList = await emailService.updateMailingList(data);
      setMailingLists(prev => prev.map(l => l.id === data.id ? updatedList : l));
      return updatedList;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update mailing list');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteMailingList = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await emailService.deleteMailingList(id);
      setMailingLists(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete mailing list');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mailingLists,
    isLoading,
    error,
    fetchMailingLists,
    createMailingList,
    updateMailingList,
    deleteMailingList
  };
};

export const useMailingCampaigns = () => {
  const [campaigns, setCampaigns] = useState<MailingCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await emailService.getCampaigns();
      setCampaigns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCampaign = useCallback(async (data: CreateMailingCampaignRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const newCampaign = await emailService.createCampaign(data);
      setCampaigns(prev => [...prev, newCampaign]);
      return newCampaign;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCampaign = useCallback(async (data: UpdateMailingCampaignRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedCampaign = await emailService.updateCampaign(data);
      setCampaigns(prev => prev.map(c => c.id === data.id ? updatedCampaign : c));
      return updatedCampaign;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update campaign');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCampaign = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await emailService.deleteCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendCampaign = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await emailService.sendCampaign(id);
      setCampaigns(prev => prev.map(c => 
        c.id === id ? { ...c, status: 'sent', sentAt: new Date() } : c
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send campaign');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    campaigns,
    isLoading,
    error,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign
  };
};

export const useEmailAnalytics = () => {
  const [metrics, setMetrics] = useState<EmailMetrics | null>(null);
  const [campaignStats, setCampaignStats] = useState<Record<number, CampaignStats>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await emailService.getEmailMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch email metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCampaignStats = useCallback(async (campaignId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await emailService.getCampaignStats(campaignId);
      setCampaignStats(prev => ({ ...prev, [campaignId]: stats }));
      return stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaign stats');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    metrics,
    campaignStats,
    isLoading,
    error,
    fetchMetrics,
    fetchCampaignStats
  };
};
