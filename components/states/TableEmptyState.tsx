import EmptyState from "./EmptyState";

interface TableEmptyStateProps {
  colSpan: number;
  title?: string;
  description?: string;
}

export default function TableEmptyState({ colSpan, title, description }: TableEmptyStateProps) {
  return (
    <tbody>
      <tr>
        <td colSpan={colSpan} className="p-0">
          <EmptyState title={title} description={description} className="border-0 rounded-none" />
        </td>
      </tr>
    </tbody>
  );
}