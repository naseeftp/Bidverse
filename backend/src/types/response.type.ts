export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T
}

export interface IPaginationMeta{
    totalItems:number;
    itemsPerPage:number;
    currentPage:number;
    totalPages:number;
    hasNextPage:boolean;
    hasPrevPage:boolean;
}
export interface IGenericPaginatedResposnse<T>{
   data:T[];
   pagination:IPaginationMeta
}