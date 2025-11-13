import React from 'react';
import Skeleton from '../ui/Skeleton';

interface TableSkeletonProps {
    rows?: number;
    cols?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, cols = 6 }) => {
    return (
        <>
            {[...Array(rows)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                    <td className="p-3">
                        <div className="flex items-center">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="ml-4 flex-1">
                                <Skeleton className="h-4 w-3/4 mb-1" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    </td>
                    {[...Array(cols - 1)].map((_, colIndex) => (
                         <td className="p-3" key={colIndex}>
                            <Skeleton className="h-5 w-4/5" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
};

export default TableSkeleton;
