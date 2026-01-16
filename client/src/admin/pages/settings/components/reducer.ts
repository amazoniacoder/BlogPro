interface EmailTemplate {
  id?: number;
  name: string;
  subject: string;
  content: string;
}

interface TemplateState {
  formData: EmailTemplate;
}

type TemplateAction = 
  | { type: 'SET_TEMPLATE'; payload: EmailTemplate }
  | { type: 'UPDATE_FIELD'; field: keyof EmailTemplate; value: string };

export const templateReducer = (state: TemplateState, action: TemplateAction): TemplateState => {
  switch (action.type) {
    case 'SET_TEMPLATE':
      // Only update if it's actually a different template
      if (action.payload.id !== state.formData.id) {
        return { formData: { ...action.payload } };
      }
      return state;
    case 'UPDATE_FIELD':
      return {
        formData: {
          ...state.formData,
          [action.field]: action.value
        }
      };
    default:
      return state;
  }
};

interface ManagerState {
  templates: EmailTemplate[];
  selectedTemplate: EmailTemplate | null;
  isEditing: boolean;
  loading: boolean;
  error: string | null;
  showDeleteModal: boolean;
  templateToDelete: number | null;
}

type ManagerAction = 
  | { type: 'SET_TEMPLATES'; payload: EmailTemplate[] }
  | { type: 'SET_SELECTED_TEMPLATE'; payload: EmailTemplate | null }
  | { type: 'SET_EDITING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'FETCH_TEMPLATES' }
  | { type: 'SHOW_DELETE_MODAL'; payload: number }
  | { type: 'HIDE_DELETE_MODAL' };

export const managerReducer = (state: ManagerState, action: ManagerAction): ManagerState => {
  switch (action.type) {
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload };
    case 'SET_SELECTED_TEMPLATE':
      return { ...state, selectedTemplate: action.payload };
    case 'SET_EDITING':
      return { ...state, isEditing: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'FETCH_TEMPLATES':
      return state; // Side effect handled elsewhere
    case 'SHOW_DELETE_MODAL':
      return { ...state, showDeleteModal: true, templateToDelete: action.payload };
    case 'HIDE_DELETE_MODAL':
      return { ...state, showDeleteModal: false, templateToDelete: null };
    default:
      return state;
  }
};

interface MailingListState {
  mailingLists: MailingList[];
  selectedList: MailingList | null;
  isEditing: boolean;
  loading: boolean;
  error: string | null;
  templates: EmailTemplate[];
}

interface MailingList {
  id?: number;
  name: string;
  description: string;
  templateId?: number | null;
  status: string;
}

type MailingListAction = 
  | { type: 'SET_MAILING_LISTS'; payload: MailingList[] }
  | { type: 'SET_SELECTED_LIST'; payload: MailingList | null }
  | { type: 'SET_EDITING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TEMPLATES'; payload: EmailTemplate[] }
  | { type: 'UPDATE_LIST_FIELD'; field: keyof MailingList; value: string | number | null };

export const mailingListReducer = (state: MailingListState, action: MailingListAction): MailingListState => {
  switch (action.type) {
    case 'SET_MAILING_LISTS':
      return { ...state, mailingLists: action.payload };
    case 'SET_SELECTED_LIST':
      return { ...state, selectedList: action.payload };
    case 'SET_EDITING':
      return { ...state, isEditing: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_LIST_FIELD':
      return {
        ...state,
        selectedList: state.selectedList ? {
          ...state.selectedList,
          [action.field]: action.value
        } : null
      };
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload };
    default:
      return state;
  }
};

export type { EmailTemplate, TemplateState, TemplateAction, ManagerState, ManagerAction, MailingListState, MailingListAction, MailingList };
