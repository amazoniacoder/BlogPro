import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  AdminTabbedLayout,
  AdminTabBar,
  AdminTabContent,
  AdminTabPanel
} from "@/ui-system/components/admin/layout";
import {
  SettingsGeneral,
  SettingsSecurity,
  SettingsNotifications,
  SettingsContact,
  SettingsMailings,
  SettingsApi,
  SettingsCssAnalyzer,
  SettingsStateManager,
  useSettingsState
} from "@/ui-system/components/admin/settings";

import type { IconName } from "@/ui-system/icons/components";
import { useKeyboardNavigation } from "@/ui-system/hooks/useKeyboardNavigation";

const SettingsPageContent = () => {
  const { t } = useTranslation(['admin', 'common']);
  const { state, setActiveTab, saveSettings, discardChanges } = useSettingsState();


  const tabs = [
    { id: "general", label: t('admin:general', { defaultValue: 'General' }), icon: 'gear' as IconName },
    { id: "security", label: t('admin:security', { defaultValue: 'Security' }), icon: 'user' as IconName },
    { id: "notifications", label: t('admin:notifications', { defaultValue: 'Notifications' }), icon: 'bell' as IconName },
    { id: "contact", label: t('admin:contact', { defaultValue: 'Contact' }), icon: 'users' as IconName },
    { id: "mailings", label: t('admin:mailings', { defaultValue: 'Mailings' }), icon: 'share' as IconName },
    { id: "css-analyzer", label: t('admin:cssAnalyzer', { defaultValue: 'CSS Analyzer' }), icon: 'wrench' as IconName },
    { id: "api", label: t('admin:api', { defaultValue: 'API' }), icon: 'puzzle' as IconName }
  ];

  const handleSaveSettings = useCallback(async (settings: any) => {
    console.log("Saving settings:", settings);
    await saveSettings();
  }, [saveSettings]);

  // Keyboard shortcuts
  useKeyboardNavigation({
    onSave: () => state.hasUnsavedChanges ? saveSettings() : undefined,
    onDiscard: () => state.hasUnsavedChanges ? discardChanges() : undefined,
    enabled: true
  });

  const handleTabChange = useCallback(async (newTab: string) => {
    const success = await setActiveTab(newTab);
    return success;
  }, [setActiveTab]);


  return (
    <AdminTabbedLayout>
      <AdminTabBar 
        tabs={tabs}
        activeTab={state.activeTab} 
        onTabChange={handleTabChange}
        hasUnsavedChanges={state.hasUnsavedChanges}
      />

      <AdminTabContent activeTab={state.activeTab}>
        <AdminTabPanel id="general">
          <SettingsGeneral onSave={handleSaveSettings} />
        </AdminTabPanel>
        
        <AdminTabPanel id="security">
          <SettingsSecurity onSave={handleSaveSettings} />
        </AdminTabPanel>
        
        <AdminTabPanel id="notifications">
          <SettingsNotifications onSave={handleSaveSettings} />
        </AdminTabPanel>
        
        <AdminTabPanel id="contact">
          <SettingsContact onSave={handleSaveSettings} />
        </AdminTabPanel>
        
        <AdminTabPanel id="mailings">
          <SettingsMailings onSave={handleSaveSettings} />
        </AdminTabPanel>
        
        <AdminTabPanel id="css-analyzer">
          <SettingsCssAnalyzer />
        </AdminTabPanel>
        
        <AdminTabPanel id="api">
          <SettingsApi onSave={handleSaveSettings} />
        </AdminTabPanel>
      </AdminTabContent>
    </AdminTabbedLayout>
  );
};

const SettingsPage = () => {
  const handleSaveAll = async (data: Record<string, any>) => {
    // Implement actual save logic here
    console.log('Saving all settings:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <SettingsStateManager onSave={handleSaveAll} autoSaveDelay={5000}>
      <SettingsPageContent />
    </SettingsStateManager>
  );
};

export default SettingsPage;
