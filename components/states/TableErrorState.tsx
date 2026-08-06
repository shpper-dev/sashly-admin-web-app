import ErrorState from "./ErrorState";

interface TableErrorStateProps {
  colSpan: number;
  description?: string;
  onRetry?: () => void;
}

export default function TableErrorState({ colSpan, description, onRetry }: TableErrorStateProps) {
  return (
    <tbody>
      <tr>
        <td colSpan={colSpan} className="p-0">
          <ErrorState description={description} onRetry={onRetry} className="border-0 rounded-none" />
        </td>
      </tr>
    </tbody>
  );
}