import { Timer } from 'lucide-react';

export default function WaitTimeBadge({time}:{time:string}) {
    function getWaitTimeColor(time: string){
        // convert string to total minutes
        const hourMatch = time.match(/(\d+)h/);
        const minuteMatch = time.match(/(\d+)m/);
        
        const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
        const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
        const totalMinutes = hours * 60 + minutes;

        if (totalMinutes < 45) return "text-purple-600";
        if(totalMinutes <= 90) return "text-yellow-600";
        return "text-red-600";
    } 
  return (
     <div className="flex items-center">
          <Timer className={`h-4 w-4 ${getWaitTimeColor(time)}`} />
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getWaitTimeColor(time)}`}>
            {time}
          </span>
        </div>
  )
}
