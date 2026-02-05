import { useState, useCallback } from 'react';

/**
 * Configuration for editable entity hook
 */
export interface UseEditableEntityConfig<TEntity, TState> {
  /**
   * Initial entity data
   */
  entity: TEntity;
  
  /**
   * Function to initialize editing state from entity
   * Called when entering edit mode or when entity changes
   */
  initializeEditState: (entity: TEntity) => TState;
  
  /**
   * Validation function - return error message or null if valid
   */
  validate?: (editState: TState) => string | null;
  
  /**
   * Save function - receives edit state and should persist changes
   */
  onSave: (editState: TState) => Promise<void>;
  
  /**
   * Optional callback when edit mode is cancelled
   */
  onCancel?: () => void;
  
  /**
   * Optional callback when save succeeds
   */
  onSaveSuccess?: () => void;
  
  /**
   * Optional callback when save fails
   */
  onSaveError?: (error: Error) => void;
}

/**
 * Generic hook for managing edit/view toggle pattern with local state
 * 
 * @template TEntity The type of the source entity (e.g. Loan)
 * @template TState The type of the editing state (e.g. { name: string, ... })
 */
export function useEditableEntity<TEntity, TState>({
  entity,
  initializeEditState,
  validate,
  onSave,
  onCancel,
  onSaveSuccess,
  onSaveError
}: UseEditableEntityConfig<TEntity, TState>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState<TState>(() => 
    initializeEditState(entity)
  );
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Enter edit mode
   */
  const startEdit = useCallback(() => {
    setEditState(initializeEditState(entity));
    setIsEditing(true);
  }, [entity, initializeEditState]);

  /**
   * Exit edit mode without saving
   */
  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    onCancel?.();
  }, [onCancel]);

  /**
   * Update a single field in edit state
   */
  const updateField = useCallback(<K extends keyof TState>(field: K, value: TState[K]) => {
    setEditState(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Update multiple fields at once
   */
  const updateFields = useCallback((updates: Partial<TState>) => {
    setEditState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Replace entire edit state
   */
  const replaceEditState = useCallback((newState: TState) => {
    setEditState(newState);
  }, []);

  /**
   * Validate and save changes
   */
  const saveEdit = useCallback(async (): Promise<boolean> => {
    // Validate
    if (validate) {
      const error = validate(editState);
      if (error) {
        onSaveError?.(new Error(error));
        return false;
      }
    }

    // Save
    setIsSaving(true);
    try {
      await onSave(editState);
      setIsEditing(false);
      onSaveSuccess?.();
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Save failed');
      onSaveError?.(error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [editState, validate, onSave, onSaveSuccess, onSaveError]);

  return {
    isEditing,
    editState,
    isSaving,
    startEdit,
    cancelEdit,
    saveEdit,
    updateField,
    updateFields,
    replaceEditState
  };
}
