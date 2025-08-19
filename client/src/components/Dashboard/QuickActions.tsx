import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Receipt } from "lucide-react";

export function QuickActions() {
  return (
    <div className="space-y-3">
      <Button variant="outline" className="w-full justify-start border-dashed hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
        <Plus className="h-4 w-4 mr-3 text-blue-600" />
        <span>New Appointment</span>
      </Button>
      <Button variant="outline" className="w-full justify-start border-dashed hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
        <UserPlus className="h-4 w-4 mr-3 text-green-600" />
        <span>Add Client</span>
      </Button>
      <Button variant="outline" className="w-full justify-start border-dashed hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20">
        <Receipt className="h-4 w-4 mr-3 text-purple-600" />
        <span>Record Sale</span>
      </Button>
    </div>
  );
}
