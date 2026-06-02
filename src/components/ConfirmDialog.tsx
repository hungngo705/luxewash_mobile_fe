/**
 * Cross-platform confirm dialog.
 * Uses React state internally so callbacks always fire on both web and mobile,
 * unlike react-native Alert.alert which maps to blocking window.alert() on web.
 */
import React, { useState, useCallback, createContext, useContext, ReactNode } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LuxeColors, LuxeSpacing, LuxeBorderRadius } from "@/constants/luxeTheme";

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  showCancel?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => void;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType>({
  confirm: () => {},
});

export function useConfirmDialog() {
  return useContext(ConfirmDialogContext);
}

interface ConfirmDialogState {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  destructive: boolean;
  showCancel: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmDialogState>({
    visible: false,
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Hủy",
    destructive: false,
    showCancel: true,
  });

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    setState({
      visible: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText ?? "OK",
      cancelText: options.cancelText ?? "Hủy",
      destructive: options.destructive ?? false,
      showCancel: options.showCancel ?? true,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    setState((prev) => ({ ...prev, visible: false }));
    await state.onConfirm?.();
  }, [state.onConfirm]);

  const handleCancel = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
    state.onCancel?.();
  }, [state.onCancel]);

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        visible={state.visible}
        title={state.title}
        message={state.message}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        destructive={state.destructive}
        showCancel={state.showCancel}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmDialogContext.Provider>
  );
}

function ConfirmDialog({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  destructive,
  showCancel,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  destructive?: boolean;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, !showCancel && styles.dialogSingleBtn]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={[styles.buttons, !showCancel && styles.buttonsSingle]}>
            {showCancel && (
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.btn, destructive ? styles.destructiveBtn : styles.confirmBtn, !showCancel && styles.confirmBtnFull]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={[styles.confirmText, destructive && styles.destructiveText]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: LuxeSpacing.lg,
  },
  dialog: {
    backgroundColor: "#FFFFFF",
    borderRadius: LuxeBorderRadius.xl,
    padding: LuxeSpacing.xl,
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 25,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: LuxeColors.onSurface,
    marginBottom: LuxeSpacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: LuxeColors.onSurfaceVariant,
    marginBottom: LuxeSpacing.xl,
    textAlign: "center",
    lineHeight: 20,
  },
  buttons: {
    flexDirection: "row",
    gap: LuxeSpacing.md,
  },
  buttonsSingle: {
    justifyContent: "center",
  },
  dialogSingleBtn: {
    alignItems: "center",
  },
  btn: {
    flex: 1,
    paddingVertical: LuxeSpacing.md,
    borderRadius: LuxeBorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: LuxeColors.surfaceContainerLow + "80",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: LuxeColors.onSurfaceVariant,
  },
  confirmBtn: {
    backgroundColor: LuxeColors.primaryContainer,
  },
  confirmBtnFull: {
    minWidth: 120,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "600",
    color: LuxeColors.primary,
  },
  destructiveBtn: {
    backgroundColor: "#FEE2E2",
  },
  destructiveText: {
    color: "#DC2626",
  },
});
