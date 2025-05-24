import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-linked-in-resume-draft',
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './linked-in-resume-draft.component.html',
  styleUrl: './linked-in-resume-draft.component.css'
})
export class LinkedInResumeDraftComponent implements OnInit {
  initialProfileId: string | null = null;
  currentLinkInForm: string = '';
  resumeData: any = null;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(private readonly router: Router, private readonly activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const profileIdFromRoute = params.get('profileId');
      if (profileIdFromRoute) {
        this.initialProfileId = profileIdFromRoute;
        this.currentLinkInForm = this.initialProfileId;
        this.fetchResume(`https://linkedin.com/in/${this.initialProfileId}`);
      } else {
        console.error('No profile ID found in route params.');
      }
    });
  }

  fetchResume(urlToFetch: string): void {
    if (!urlToFetch || urlToFetch.trim() === '') {
      this.error = 'LinkedIn URL is required to generate a draft.';
      this.resumeData = null;
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.resumeData = null; // Clear previous data
    console.log(`Simulating fetch for: ${urlToFetch}`);

    // Simulate API Call
    setTimeout(() => {
      if (urlToFetch.toLowerCase().includes('error')) {
        this.error = 'Could not fetch or generate resume. Please check the URL or try again.';
        this.resumeData = null;
      } else if (!urlToFetch.toLowerCase().includes('linkedin.com/in/')) {
        this.error = 'Invalid LinkedIn profile URL format. It should be like linkedin.com/in/your-id';
        this.resumeData = null;
      } else {
        // Simulate successful data fetch
        this.resumeData = {
          name: 'Generated Name ' + Date.now().toString().slice(-4),
          title: 'Dynamic Professional Title',
          email: 'example@example.com',
          phone: '123-456-7890',
          linkedin: urlToFetch,
          summary: `This is a dynamically generated summary for the profile at ${urlToFetch}. It highlights key skills and experiences derived from the profile, showcasing adaptability and a forward-thinking approach.`,
          experience: [
            {
              role: 'Senior Developer',
              company: 'Tech Solutions Inc.',
              duration: 'Jan 2022 - Present',
              description: 'Led development of innovative software solutions.'
            },
            {
              role: 'Junior Developer',
              company: 'Web Wizards Co.',
              duration: 'June 2020 - Dec 2021',
              description: 'Assisted in full-stack web application development.'
            }
          ],
          education: [
            {
              degree: 'B.S. in Computer Science',
              institution: 'State University',
              year: '2020'
            }
          ],
          skills: ['Angular', 'TypeScript', 'Node.js', 'Problem Solving', 'Teamwork']
        };
        this.error = null;
      }
      this.isLoading = false;
    }, 2000);

    // In a real app, you would use a service:
    // this.resumeService.generateResume(urlToFetch).subscribe({
    //   next: (data) => {
    //     this.resumeData = data;
    //     this.isLoading = false;
    //   },
    //   error: (err) => {
    //     this.error = 'Failed to load resume data. ' + err.message;
    //     this.isLoading = false;
    //   }
    // });
  }

  // Called when the form AT THE BOTTOM of resume-draft.component is submitted
  submitOrUpdateResume(): void {
    if (this.currentLinkInForm && this.currentLinkInForm.trim() !== '') {
      // Update the route if the link has changed significantly or was not present
      // This makes bookmarking/sharing the link reflect the current state
      const newEncodedLink = encodeURIComponent(this.currentLinkInForm.trim());
      if (!this.initialProfileId || encodeURIComponent(this.initialProfileId) !== newEncodedLink) {
        this.router.navigate(['/resume-draft', newEncodedLink], {replaceUrl: true});
        // No need to call fetchResume here if paramMap subscription handles it,
        // but if it doesn't trigger for replaceUrl on same component, call it directly.
        // For simplicity here, we will call it directly.
        this.initialProfileId = this.currentLinkInForm.trim(); // update initial for next comparison
      }
      this.fetchResume(this.currentLinkInForm.trim());
    } else {
      this.error = 'Please enter a LinkedIn profile URL.';
      this.resumeData = null; // Clear resume if link is removed
    }
  }
}
