import { WorkflowApproval as SwaggerWorkflowApproval } from './generated-from-swagger/api';
import {
  SummaryFieldJob,
  SummaryFieldUnifiedJobTemplate,
  SummaryFieldWorkflowApprovalTemplate,
  SummaryFieldWorkflowJob,
  SummaryFieldWorkflowJobTemplate,
  SummaryFieldsByUser,
} from './summary-fields/summary-fields';

export interface WorkflowApproval
  extends Omit<
    SwaggerWorkflowApproval,
    'id' | 'name' | 'summary_fields' | 'status' | 'timed_out' | 'elapsed'
  > {
  id: number;
  name: string;
  summary_fields: {
    workflow_job_template: SummaryFieldWorkflowJobTemplate;
    workflow_job: SummaryFieldWorkflowJob;
    workflow_approval_template: SummaryFieldWorkflowApprovalTemplate;
    unified_job_template: SummaryFieldUnifiedJobTemplate;
    created_by: SummaryFieldsByUser;
    user_capabilities: {
      delete: boolean;
      start: boolean;
    };
    source_workflow_job: SummaryFieldJob | object;
  };
  status:
    | 'new'
    | 'pending'
    | 'waiting'
    | 'running'
    | 'successful'
    | 'failed'
    | 'error'
    | 'canceled';
  timed_out: boolean;
  elapsed: number;
}
