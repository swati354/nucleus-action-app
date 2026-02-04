/**
 * React hook for Action Center integration
 *
 * Provides state management and communication with UiPath Action Center
 * using the TaskEventsService.
 *
 * The form renders immediately with initial/mock data.
 * When Action Center sends data, it updates automatically.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { sdk, initializeSdk, updateToken } from '../lib/uipath';
import {
  ActionCenterData,
  ActionFormData,
  Theme,
} from '../types/action-schema';

interface UseActionContextOptions {
  /**
   * Initial/default data for the form.
   * This data is shown immediately while waiting for Action Center.
   * When Action Center sends data, it replaces this.
   *
   * @example
   * ```tsx
   * const { formData } = useActionContext({
   *   initialData: {
   *     applicantName: 'John Doe',
   *     loanAmount: 50000,
   *   }
   * });
   * ```
   */
  initialData?: Record<string, unknown>;
}

interface UseActionContextResult {
  /** Current task data from Action Center (null until received) */
  taskData: ActionCenterData | null;
  /** Current form data (inputs + outputs + inOuts) */
  formData: ActionFormData;
  /** Whether the task is read-only (already completed) */
  isReadOnly: boolean;
  /** Current theme from Action Center */
  theme: Theme;
  /** Current language from Action Center */
  language: string;
  /** Whether Action Center has sent data yet */
  hasActionCenterData: boolean;
  /** Update a single form field */
  updateField: (fieldName: string, value: unknown) => void;
  /** Update multiple form fields at once */
  updateFormData: (data: Partial<ActionFormData>) => void;
  /** Complete the task with an outcome */
  completeTask: (outcome: string) => void;
  /** Reset form to initial data */
  resetForm: () => void;
}

/**
 * Hook for managing Action Center communication and form state
 *
 * The form renders immediately - no loading state needed.
 * Pass initialData to show default values while waiting for Action Center.
 * When Action Center sends data, it automatically updates the form.
 *
 * @example
 * ```tsx
 * function MyActionApp() {
 *   const {
 *     formData,
 *     isReadOnly,
 *     hasActionCenterData,
 *     updateField,
 *     completeTask,
 *   } = useActionContext({
 *     initialData: {
 *       applicantName: 'Test User',
 *       loanAmount: 25000,
 *     }
 *   });
 *
 *   return (
 *     <div>
 *       {!hasActionCenterData && (
 *         <div className="bg-yellow-100 p-2">Preview Mode</div>
 *       )}
 *       <input
 *         value={formData.applicantName || ''}
 *         disabled={isReadOnly}
 *       />
 *       <input
 *         value={formData.riskFactor || ''}
 *         onChange={(e) => updateField('riskFactor', e.target.value)}
 *         disabled={isReadOnly}
 *       />
 *       <button onClick={() => completeTask('Approve')}>Approve</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useActionContext(options: UseActionContextOptions = {}): UseActionContextResult {
  const { initialData = {} } = options;

  const [taskData, setTaskData] = useState<ActionCenterData | null>(null);
  const [formData, setFormData] = useState<ActionFormData>(initialData as ActionFormData);
  const [theme, setTheme] = useState<Theme>(Theme.Light);
  const [language, setLanguage] = useState('en');
  const [hasActionCenterData, setHasActionCenterData] = useState(false);

  const initialDataRef = useRef<ActionFormData>(initialData as ActionFormData);
  const isInitializedRef = useRef(false);

  // Notify Action Center of data changes (silent fail in preview mode)
  const notifyDataChanged = useCallback((data: ActionFormData) => {
    try {
      sdk.taskEvents.dataChanged(data);
    } catch {
      // Expected when not running in Action Center (preview mode)
    }
  }, []);

  // Initialize Action Center connection on mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    try {
      // Subscribe to Action Center events
      sdk.taskEvents.getTaskDetailsFromActionCenter((data: ActionCenterData) => {
        console.log('[Action Context] Received data from Action Center:', data);

        // Update task data
        setTaskData(data);

        // Initialize SDK with Action Center credentials
        if (data.baseUrl && data.orgName && data.tenantName && data.token) {
          initializeSdk({
            baseUrl: data.baseUrl,
            orgName: data.orgName,
            tenantName: data.tenantName,
            token: data.token,
          });
        }

        // Handle token refresh
        if (data.newToken) {
          updateToken(data.newToken);
        }

        // Handle theme change
        setTheme((data.newTheme ?? data.theme) as Theme);

        // Handle language change
        setLanguage(data.newLanguage ?? data.language ?? 'en');

        // Set form data from Action Center data
        if (data.data) {
          setFormData(data.data as ActionFormData);
          initialDataRef.current = data.data as ActionFormData;
        }

        // Set hasActionCenterData LAST to ensure formData is updated first
        // This prevents useEffects from running with stale initial data
        setHasActionCenterData(true);
      });

      // Signal to Action Center that we're ready
      sdk.taskEvents.initializeInActionCenter();

      console.log('[Action Context] Initialized - waiting for Action Center data');
    } catch (err) {
      console.error('[Action Context] Failed to initialize:', err);
      // Don't throw - the form will still work with initial data
    }
  }, []);

  // Update a single field and notify Action Center
  const updateField = useCallback((fieldName: string, value: unknown) => {
    setFormData((prev) => {
      const updated = { ...prev, [fieldName]: value };
      notifyDataChanged(updated);
      return updated;
    });
  }, [notifyDataChanged]);

  // Update multiple fields at once
  const updateFormData = useCallback((data: Partial<ActionFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...data };
      notifyDataChanged(updated);
      return updated;
    });
  }, [notifyDataChanged]);

  // Complete the task with an outcome
  const completeTask = useCallback((outcome: string) => {
    console.log('[Action Context] Completing task with outcome:', outcome, formData);

    try {
      sdk.taskEvents.completeTask(outcome, formData);
    } catch {
      // If not in Action Center, show what would happen
      console.log('[Action Context] Task complete (preview):', { outcome, formData });
      alert(`Task completed with outcome: ${outcome}\n\nForm Data:\n${JSON.stringify(formData, null, 2)}`);
    }
  }, [formData]);

  // Reset form to initial data
  const resetForm = useCallback(() => {
    setFormData(initialDataRef.current);
    notifyDataChanged(initialDataRef.current);
  }, [notifyDataChanged]);

  return {
    taskData,
    formData,
    isReadOnly: taskData?.isReadOnly ?? false,
    theme,
    language,
    hasActionCenterData,
    updateField,
    updateFormData,
    completeTask,
    resetForm,
  };
}

/**
 * Hook to get just the theme from Action Center
 * Useful for components that only need theme info
 */
export function useActionTheme(): Theme {
  const { theme } = useActionContext();
  return theme;
}

/**
 * Hook to check if the task is read-only
 */
export function useIsReadOnly(): boolean {
  const { isReadOnly } = useActionContext();
  return isReadOnly;
}
