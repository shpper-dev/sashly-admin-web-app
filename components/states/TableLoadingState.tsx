import LoadingState from "./LoadingState";

interface TableLoadingStateProps {
  colSpan: number;
  title?: string;
  description?: string;
}

export default function TableLoadingState({
  colSpan,
  title = "Loading…",
  description,
}: TableLoadingStateProps) {
  return (
    <tbody>
      <tr>
        <td colSpan={colSpan} className="p-0">
          <LoadingState title={title} description={description} className="border-0 rounded-none" />
        </td>
      </tr>
    </tbody>
  );
}