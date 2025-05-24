'use client';

import { useState, useCallback } from 'react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export function useConfirmation() {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    type: 'warning',
    icon: null
  });

  const openConfirmation = useCallback(({
    title = 'Confirmation',
    message = 'Êtes-vous sûr de vouloir continuer ?',
    onConfirm,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    type = 'warning',
    icon = null
  }) => {
    setDialogState({
      isOpen: true,
      title,
      message,
      onConfirm: onConfirm || (() => {}),
      confirmText,
      cancelText,
      type,
      icon
    });
  }, []);

  const closeConfirmation = useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const ConfirmationDialogComponent = useCallback(() => {
    return (
      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        onClose={closeConfirmation}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        type={dialogState.type}
        icon={dialogState.icon}
      />
    );
  }, [dialogState, closeConfirmation]);

  return {
    openConfirmation,
    closeConfirmation,
    ConfirmationDialog: ConfirmationDialogComponent
  };
}
