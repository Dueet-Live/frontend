import { NoteFeedback } from '../../Game/utils/NoteFeedback';

export type NoteFeedbackMessage = { id: string; num: NoteFeedback };

export type NoteFeedbackAreaHandle = {
  enqueueFeedback: (feedback: NoteFeedback) => void;
};
export type NoteFeedbackAreaHandleRef = React.MutableRefObject<NoteFeedbackAreaHandle | null>;
