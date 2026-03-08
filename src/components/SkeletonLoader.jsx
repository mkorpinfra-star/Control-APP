// Skeleton Loader Component - Nubank Style
// Baseado nas melhores práticas de skeleton loading do React

export const SkeletonCard = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-200 rounded-2xl h-full w-full"></div>
  </div>
);

export const SkeletonText = ({ lines = 1, className = '' }) => (
  <div className={`animate-pulse space-y-2 ${className}`}>
    {[...Array(lines)].map((_, i) => (
      <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: i === lines - 1 ? '75%' : '100%' }}></div>
    ))}
  </div>
);

export const SkeletonCircle = ({ size = 48, className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-200 rounded-full" style={{ width: size, height: size }}></div>
  </div>
);

export const SkeletonButton = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-200 rounded-xl h-10 w-full"></div>
  </div>
);

// Skeleton específico para lista de projetos
export const SkeletonProjectCard = () => (
  <div className="bg-[#F5F5F5] rounded-2xl p-4 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
      <div className="flex gap-2">
        <div className="w-9 h-9 bg-gray-300 rounded-full"></div>
        <div className="w-9 h-9 bg-gray-300 rounded-full"></div>
      </div>
    </div>
    <div className="flex items-center gap-2 mt-3">
      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      <div className="h-4 bg-gray-300 rounded w-24"></div>
    </div>
  </div>
);

// Skeleton específico para lista de empleados
export const SkeletonEmployeeCard = () => (
  <div className="bg-[#F5F5F5] rounded-2xl p-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gray-300 rounded-full shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
      <div className="flex gap-2 shrink-0">
        <div className="w-9 h-9 bg-gray-300 rounded-full"></div>
        <div className="w-9 h-9 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  </div>
);

// Skeleton específico para notificações
export const SkeletonNotificationCard = () => (
  <div className="bg-[#F5F5F5] rounded-2xl p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-gray-300 rounded-xl shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-full"></div>
      </div>
    </div>
  </div>
);

// Skeleton para stats cards (dashboard)
export const SkeletonStatCard = () => (
  <div className="bg-[#F5F5F5] rounded-xl p-3 min-h-[100px] flex flex-col items-center justify-start animate-pulse">
    <div className="w-7 h-7 bg-gray-300 rounded-lg mb-2 mt-1"></div>
    <div className="w-10 h-6 bg-gray-300 rounded mb-1"></div>
    <div className="w-16 h-3 bg-gray-300 rounded"></div>
  </div>
);

// Skeleton para aprovações
export const SkeletonApprovalCard = () => (
  <div className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    </div>
    <div className="flex gap-2 mt-3">
      <div className="flex-1 h-10 bg-gray-300 rounded-xl"></div>
      <div className="flex-1 h-10 bg-gray-300 rounded-xl"></div>
    </div>
  </div>
);

// Skeleton para timesheet
export const SkeletonTimesheetForm = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-12 bg-gray-200 rounded-xl"></div>
    <div className="h-12 bg-gray-200 rounded-xl"></div>
    <div className="h-12 bg-gray-200 rounded-xl"></div>
    <div className="grid grid-cols-3 gap-3">
      <div className="h-12 bg-gray-200 rounded-xl"></div>
      <div className="h-12 bg-gray-200 rounded-xl"></div>
      <div className="h-12 bg-gray-200 rounded-xl"></div>
    </div>
    <div className="h-12 bg-gray-200 rounded-xl"></div>
  </div>
);

export default {
  Card: SkeletonCard,
  Text: SkeletonText,
  Circle: SkeletonCircle,
  Button: SkeletonButton,
  ProjectCard: SkeletonProjectCard,
  EmployeeCard: SkeletonEmployeeCard,
  NotificationCard: SkeletonNotificationCard,
  StatCard: SkeletonStatCard,
  ApprovalCard: SkeletonApprovalCard,
  TimesheetForm: SkeletonTimesheetForm
};
