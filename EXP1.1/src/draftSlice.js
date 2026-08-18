const initialDraftState = {
  drafts: [],
  selectedDraftId: null,
};

function draftReducer(state, action) {
  switch (action.type) {
    case 'draft/add':
      return { ...state, drafts: [action.payload, ...state.drafts] };
    case 'draft/update':
      return {
        ...state,
        drafts: state.drafts.map((draft) =>
          draft.id === action.payload.id ? { ...draft, ...action.payload } : draft
        ),
      };
    case 'draft/delete':
      return {
        ...state,
        drafts: state.drafts.filter((draft) => draft.id !== action.payload),
        selectedDraftId: state.selectedDraftId === action.payload ? null : state.selectedDraftId,
      };
    case 'draft/select':
      return { ...state, selectedDraftId: action.payload };
    case 'draft/clearSelection':
      return { ...state, selectedDraftId: null };
    default:
      return state;
  }
}

const addDraft = (draft) => ({ type: 'draft/add', payload: draft });
const updateDraft = (draft) => ({ type: 'draft/update', payload: draft });
const deleteDraft = (draftId) => ({ type: 'draft/delete', payload: draftId });
const selectDraft = (draftId) => ({ type: 'draft/select', payload: draftId });
const clearDraftSelection = () => ({ type: 'draft/clearSelection' });

const selectDrafts = (state) => state.drafts;
const selectDraftById = (state, draftId) => state.drafts.find((draft) => draft.id === draftId) || null;
const selectDraftCount = (state) => state.drafts.length;
const selectFilteredDrafts = (state, searchTerm) => {
  const normalized = searchTerm.trim().toLowerCase();
  if (!normalized) return state.drafts;
  return state.drafts.filter(
    (draft) =>
      draft.title.toLowerCase().includes(normalized) ||
      draft.content.toLowerCase().includes(normalized)
  );
};

export {
  initialDraftState,
  draftReducer,
  addDraft,
  updateDraft,
  deleteDraft,
  selectDraft,
  clearDraftSelection,
  selectDrafts,
  selectDraftById,
  selectDraftCount,
  selectFilteredDrafts,
};
