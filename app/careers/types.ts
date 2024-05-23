// types.ts
export interface CareerPosition {
    id: number;
    title: string;
    description: string;
  }
  
  export interface CareersResponse extends Array<CareerPosition> {}
  
  export interface JobApplication {
    careerId: number;
    fullName: string;
    email: string;
    resume: File;
  }