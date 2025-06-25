import { create } from 'zustand';
import { 
  Job, 
  createJob as createJobInFirestore, 
  getJobsByRecruiter 
} from '../Firebase/Firestore';

interface JobState {
  jobs: Job[];
  selectedJob: Job | null;
  isLoading: boolean;
  loadJobs: (recruiterUid: string) => Promise<void>;
  createJob: (job: Job) => Promise<string>;
  selectJob: (job: Job | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  selectedJob: null,
  isLoading: false,
  
  loadJobs: async (recruiterUid: string) => {
    set({ isLoading: true });
    
    try {
      const jobs = await getJobsByRecruiter(recruiterUid);
      set({ jobs, isLoading: false });
    } catch (error) {
      console.error('Error loading jobs:', error);
      set({ isLoading: false });
    }
  },
  
  createJob: async (job: Job) => {
    set({ isLoading: true });
    
    try {
      const jobId = await createJobInFirestore(job);
      
      // Reload jobs after creating a new one
      const { loadJobs } = get();
      await loadJobs(job.recruiterUid);
      
      set({ isLoading: false });
      return jobId;
    } catch (error) {
      console.error('Error creating job:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  selectJob: (job: Job | null) => set({ selectedJob: job }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
}));