import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticleService } from '../../../core/services/article.service';
import { Article, ArticleCreateRequest } from '../../../core/models/article.model';
import { ImageUploadService } from '../../../core/services/image-upload.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HttpClientModule],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-xxl-10 col-xl-12">
          <!-- En-tête -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h1 class="fw-bold text-dark mb-2">{{ isEdit ? "Modifier l'article" : 'Créer un nouvel article' }}</h1>
                  <p class="text-muted mb-0">
                    {{ isEdit ? 'Modifiez votre article existant' : 'Rédigez et publiez votre nouvel article' }}
                  </p>
                </div>
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-modern"
                  routerLink="/dashboard">
                  <i class="bi bi-arrow-left me-2"></i>
                  Retour
                </button>
              </div>
            </div>
          </div>

          <!-- Début du formulaire principal -->
          <form [formGroup]="articleForm" (ngSubmit)="onSubmit()">
            <div class="row">
              <!-- Formulaire principal -->
              <div class="col-lg-8">
                <div class="card card-modern border-0 shadow-sm mb-4">
                  <div class="card-body p-4">
                    <!-- Titre -->
                    <div class="mb-4">
                      <label for="title" class="form-label fw-semibold text-dark">
                        Titre de l'article <span class="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        class="form-control form-control-lg border-0 bg-light rounded-3 py-3 px-4"
                        formControlName="title"
                        placeholder="Donnez un titre percutant à votre article..."
                        [class.is-invalid]="articleForm.get('title')?.invalid && articleForm.get('title')?.touched">

                      @if (articleForm.get('title')?.invalid && articleForm.get('title')?.touched) {
                        <div class="invalid-feedback mt-2">
                          <i class="bi bi-exclamation-circle me-1"></i>
                          Le titre est requis et doit contenir moins de 200 caractères
                        </div>
                      }
                    </div>

                    <!-- Extrait -->
                    <div class="mb-4">
                      <label for="excerpt" class="form-label fw-semibold text-dark">Extrait</label>
                      <textarea
                        id="excerpt"
                        class="form-control border-0 bg-light rounded-3 p-4"
                        formControlName="excerpt"
                        rows="3"
                        placeholder="Résumez brièvement votre article (ce texte apparaîtra dans les listes)..."></textarea>
                      <div class="form-text text-muted mt-2">
                        <i class="bi bi-info-circle me-1"></i>
                        Cet extrait sera affiché dans la liste des articles et les aperçus.
                      </div>
                    </div>

                    <!-- Contenu -->
                    <div class="mb-4">
                      <label for="content" class="form-label fw-semibold text-dark">
                        Contenu <span class="text-danger">*</span>
                      </label>

                      <div class="rich-editor border rounded-3 overflow-hidden bg-light">
                        <div class="editor-toolbar bg-white border-bottom p-3">
                          <div class="d-flex gap-2 flex-wrap">
                            <button type="button" class="format-btn btn btn-sm btn-outline-secondary" data-command="bold" title="Gras">
                              <i class="bi bi-type-bold"></i>
                            </button>
                            <button type="button" class="format-btn btn btn-sm btn-outline-secondary" data-command="italic" title="Italique">
                              <i class="bi bi-type-italic"></i>
                            </button>
                            <button type="button" class="format-btn btn btn-sm btn-outline-secondary" data-command="list" title="Liste à puces">
                              <i class="bi bi-list-ul"></i>
                            </button>
                            <button type="button" class="format-btn btn btn-sm btn-outline-secondary" data-command="link" title="Lien">
                              <i class="bi bi-link"></i>
                            </button>
                            <button type="button" class="format-btn btn btn-sm btn-outline-secondary" data-command="code" title="Code">
                              <i class="bi bi-code"></i>
                            </button>
                          </div>
                        </div>

                        <textarea
                          #contentTextarea
                          id="content"
                          class="editor-content form-control border-0 p-4"
                          formControlName="content"
                          rows="20"
                          placeholder="Commencez à rédiger votre contenu ici... Vous pouvez utiliser le format Markdown pour enrichir votre texto."
                          [class.is-invalid]="articleForm.get('content')?.invalid && articleForm.get('content')?.touched"></textarea>
                      </div>

                      @if (articleForm.get('content')?.invalid && articleForm.get('content')?.touched) {
                        <div class="invalid-feedback mt-2">
                          <i class="bi bi-exclamation-circle me-1"></i>
                          Le contenu de l'article est requis
                        </div>
                      }

                      <div class="form-text text-muted mt-2">
                        <i class="bi bi-markdown me-1"></i>
                        Support Markdown : **gras**, *italique*, - listes, [liens](url)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sidebar des paramètres -->
              <div class="col-lg-4">
                <!-- Paramètres de publication -->
                <div class="card card-modern border-0 shadow-sm mb-4">
                  <div class="card-header bg-transparent border-0 py-3">
                    <h6 class="mb-0 fw-semibold text-dark">
                      <i class="bi bi-gear me-2 text-primary"></i>
                      Paramètres
                    </h6>
                  </div>
                  <div class="card-body">
                    <!-- Statut -->
                    <div class="mb-4">
                      <label for="status" class="form-label fw-semibold text-dark mb-3">Statut de publication</label>
                      <select
                        id="status"
                        class="form-select border-0 bg-light rounded-3 py-3"
                        formControlName="status">
                        <option value="draft">Brouillon</option>
                        <option value="published">Publié</option>
                      </select>
                    </div>

                    <!-- Tags -->
                    <div class="mb-4">
                      <label class="form-label fw-semibold text-dark mb-3">Tags</label>

                      <div class="input-group mb-3">
                        <input
                          type="text"
                          class="form-control border-0 bg-light rounded-3"
                          formControlName="tagsInput"
                          placeholder="Ajouter un tag..."
                          (keyup.enter)="addTag()">
                        <button
                          type="button"
                          class="btn btn-primary rounded-3"
                          (click)="addTag()">
                          <i class="bi bi-plus-lg"></i>
                        </button>
                      </div>

                      <!-- Tags ajoutés -->
                      @if (tags.length > 0) {
                        <div class="tags-container mt-3">
                          @for (tag of tags; track tag; let i = $index) {
                            <span class="tag badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-2 me-2 mb-2 d-inline-flex align-items-center">
                              <i class="bi bi-tag me-1"></i>
                              {{ tag }}
                              <button
                                type="button"
                                class="btn-close btn-close-sm ms-2"
                                (click)="removeTag(i)"
                                style="font-size: 0.6rem;">
                              </button>
                            </span>
                          }
                        </div>
                      } @else {
                        <div class="text-center text-muted py-3 border rounded-3 bg-light">
                          <i class="bi bi-tags display-6 opacity-25 mb-2"></i>
                          <p class="small mb-0">Ajoutez des tags pour catégoriser votre article</p>
                        </div>
                      }
                    </div>

                    <!-- Image de couverture -->
                    <div class="mb-4">
                      <label class="form-label fw-semibold text-dark mb-3">Image de couverture</label>

                      <div class="image-upload-container text-center border rounded-3 bg-light p-4">
                        @if (previewImage) {
                          <div class="image-preview mb-3">
                            <img
                              [src]="previewImage"
                              alt="Aperçu"
                              class="img-fluid rounded-3 shadow-sm"
                              style="max-height: 150px;">
                          </div>

                          <!-- Barre de progression -->
                          @if (uploadProgress > 0 && uploadProgress < 100) {
                            <div class="upload-progress mb-3">
                              <div class="progress" style="height: 8px;">
                                <div
                                  class="progress-bar progress-bar-striped progress-bar-animated"
                                  role="progressbar"
                                  [style.width]="uploadProgress + '%'"
                                  [attr.aria-valuenow]="uploadProgress"
                                  aria-valuemin="0"
                                  aria-valuemax="100">
                                </div>
                              </div>
                              <small class="text-muted mt-1 d-block">{{ uploadProgress }}%</small>
                            </div>
                          }

                          <div class="d-flex gap-2 justify-content-center">
                            <button
                              type="button"
                              class="btn btn-outline-primary btn-sm"
                              (click)="triggerFileInput()"
                              [disabled]="uploadProgress > 0 && uploadProgress < 100">
                              <i class="bi bi-arrow-repeat me-1"></i>
                              Changer
                            </button>
                            <button
                              type="button"
                              class="btn btn-outline-danger btn-sm"
                              (click)="removeImage()"
                              [disabled]="uploadProgress > 0 && uploadProgress < 100">
                              <i class="bi bi-trash me-1"></i>
                              Supprimer
                            </button>
                          </div>
                        } @else {
                          <div class="upload-placeholder">
                            <i class="bi bi-image display-4 text-muted opacity-25 mb-3"></i>
                            <p class="text-muted small mb-3">Aucune image sélectionnée</p>
                            <button
                              type="button"
                              class="btn btn-outline-primary btn-sm"
                              (click)="triggerFileInput()"
                              [disabled]="uploadProgress > 0 && uploadProgress < 100">
                              <i class="bi bi-upload me-1"></i>
                              Choisir une image
                            </button>

                            <!-- Barre de progression pendant l'upload -->
                            @if (uploadProgress > 0 && uploadProgress < 100) {
                              <div class="upload-progress mt-3">
                                <div class="progress" style="height: 8px;">
                                  <div
                                    class="progress-bar progress-bar-striped progress-bar-animated"
                                    role="progressbar"
                                    [style.width]="uploadProgress + '%'"
                                    [attr.aria-valuenow]="uploadProgress"
                                    aria-valuemin="0"
                                    aria-valuemax="100">
                                  </div>
                                </div>
                                <small class="text-muted mt-1">{{ uploadProgress }}%</small>
                              </div>
                            }
                          </div>
                        }

                        <input
                          #fileInput
                          type="file"
                          id="featuredImage"
                          class="d-none"
                          (change)="onFileSelected($event)"
                          accept="image/*"
                          [disabled]="uploadProgress > 0 && uploadProgress < 100">
                      </div>

                      <div class="form-text text-muted mt-2">
                        <i class="bi bi-info-circle me-1"></i>
                        Formats supportés : JPG, PNG, WebP. Max 5MB.
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="actions-sticky">
                      <div class="d-grid gap-2">
                        <button
                          type="submit"
                          class="btn btn-primary btn-modern py-3 fw-semibold"
                          [disabled]="articleForm.invalid || loading || tags.length === 0">

                          @if (loading) {
                            <span class="spinner-border spinner-border-sm me-2"></span>
                            {{ isEdit ? 'Mise à jour...' : 'Publication...' }}
                          } @else {
                            <i class="bi" [class.bi-send]="!isEdit" [class.bi-check]="isEdit"></i>
                            {{ isEdit ? 'Mettre à jour' : 'Publier maintenant' }}
                          }
                        </button>

                        <button
                          type="button"
                          class="btn btn-outline-secondary btn-modern"
                          routerLink="/dashboard">
                          <i class="bi bi-x-circle me-2"></i>
                          Annuler
                        </button>
                      </div>

                      @if (errorMessage) {
                        <div class="alert alert-danger alert-modern mt-3 mb-0">
                          <i class="bi bi-exclamation-triangle me-2"></i>
                          {{ errorMessage }}
                        </div>
                      }

                      @if (tags.length === 0 && articleForm.touched) {
                        <div class="alert alert-warning alert-modern mt-3 mb-0">
                          <i class="bi bi-exclamation-circle me-2"></i>
                          Ajoutez au moins un tag pour publier
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <!-- Aide -->
                <div class="card card-modern border-0 shadow-sm">
                  <div class="card-body">
                    <h6 class="fw-semibold text-dark mb-3">
                      <i class="bi bi-lightbulb me-2 text-warning"></i>
                      Conseils de rédaction
                    </h6>
                    <ul class="list-unstyled text-muted small">
                      <li class="mb-2">
                        <i class="bi bi-check-circle text-success me-2"></i>
                        Titre accrocheur et descriptif
                      </li>
                      <li class="mb-2">
                        <i class="bi bi-check-circle text-success me-2"></i>
                        Structurez votre contenu
                      </li>
                      <li class="mb-2">
                        <i class="bi bi-check-circle text-success me-2"></i>
                        Utilisez des images pertinentes
                      </li>
                      <li class="mb-0">
                        <i class="bi bi-check-circle text-success me-2"></i>
                        Tags précis pour le référencement
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card-modern {
      border-radius: 16px;
      overflow: hidden;
    }

    .btn-modern {
      border-radius: 12px;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      transition: all 0.3s ease;
      border: none;
    }

    .btn-modern:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .btn-modern:disabled {
      transform: none;
      box-shadow: none;
      opacity: 0.6;
    }

    .rich-editor {
      border-radius: 12px;
      overflow: hidden;
    }

    .editor-toolbar {
      border-bottom: 1px solid #e9ecef;
    }

    .format-btn {
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      transition: all 0.2s ease;
    }

    .format-btn:hover {
      background-color: #e9ecef;
      transform: translateY(-1px);
    }

    .editor-content {
      border: none !important;
      resize: vertical;
      font-family: 'Inter', sans-serif;
      line-height: 1.6;
      background: white;
    }

    .editor-content:focus {
      box-shadow: none;
      outline: none;
    }

    .tag {
      transition: all 0.2s ease;
    }

    .tag:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
    }

    .image-upload-container {
      transition: all 0.3s ease;
      border: 2px dashed #dee2e6;
    }

    .image-upload-container:hover {
      border-color: #007bff;
      background-color: rgba(0, 123, 255, 0.02);
    }

    .upload-placeholder {
      padding: 2rem 1rem;
    }

    .actions-sticky {
      position: sticky;
      top: 2rem;
    }

    .alert-modern {
      border: none;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .bg-light {
      background-color: #f8f9fa !important;
    }

    .form-control, .form-select {
      transition: all 0.3s ease;
    }

    .form-control:focus, .form-select:focus {
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.1);
      border-color: #007bff;
    }

    .btn-close-sm {
      width: 0.5em;
      height: 0.5em;
    }

    .upload-progress {
      max-width: 200px;
      margin: 0 auto;
    }

    .progress {
      border-radius: 10px;
      overflow: hidden;
    }

    .progress-bar {
      transition: width 0.3s ease;
    }

    @media (max-width: 991.98px) {
      .actions-sticky {
        position: static;
      }
    }
  `]
})
export class ArticleFormComponent implements OnInit {
  tags: string[] = [];
  isEdit = false;
  loading = false;
  errorMessage = '';
  articleId: string | null = null;
  articleForm!: FormGroup;
  previewImage: string | ArrayBuffer | null = null;

  // Variables pour GridFS
  uploadProgress = 0;
  uploadedImageId: string | null = null;
  currentImageId: string | null = null;

  @ViewChild('contentTextarea') contentTextarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private existingImageId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private imageUploadService: ImageUploadService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.articleForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      excerpt: [''],
      content: ['', [Validators.required]],
      featuredImage: [''],
      tagsInput: [''],
      status: ['draft']
    });
  }

  ngOnInit() {
    this.articleId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.articleId;

    // S'abonner à la progression de l'upload
    this.imageUploadService.uploadProgress$.subscribe(progress => {
      this.uploadProgress = progress;
    });

    if (this.isEdit && this.articleId) {
      this.loadArticle();
    }
  }

  ngAfterViewInit() {
    this.initializeEditor();
  }

  initializeEditor() {
    const toolbar = document.querySelector('.editor-toolbar');
    const textarea = this.contentTextarea.nativeElement;

    toolbar?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const button = target.closest('.format-btn') as HTMLButtonElement;

      if (!button) return;

      e.preventDefault();
      const command = button.getAttribute('data-command');

      if (command) {
        this.execCommand(command);
      }
    });
  }

  execCommand(command: string) {
    const textarea = this.contentTextarea.nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let newText = '';

    switch (command) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        break;
      case 'list':
        newText = selectedText ? `- ${selectedText.replace(/\n/g, '\n- ')}` : '- ';
        break;
      case 'link':
        newText = `[${selectedText || 'texte'}](${selectedText ? 'url' : 'https://exemple.com'})`;
        break;
      case 'code':
        newText = selectedText ? `\`${selectedText}\`` : '`code`';
        break;
      default:
        newText = selectedText;
    }

    const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    this.articleForm.patchValue({ content: newValue });

    textarea.focus();
    const newCursorPos = start + newText.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  loadArticle() {
    this.articleService.getArticleById(this.articleId!).subscribe({
      next: (response) => {
        const article = response.data.article;
        this.articleForm.patchValue({
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          status: article.status,
          featuredImage: article.featuredImage?.imageId || '' // ← AJOUTER CETTE LIGNE
        });
        this.tags = article.tags || [];

        // Charger l'image existante
        if (article.featuredImage?.imageId) {
          this.currentImageId = article.featuredImage.imageId;
          this.uploadedImageId = article.featuredImage.imageId;

          // Option 1: Utiliser directement l'URL de l'API
          this.previewImage = `http://localhost:3000/api/images/${article.featuredImage.imageId}`;
          console.log(this.previewImage)

          // Option 2: Charger en base64 (plus sûr)
          this.loadImageAsBase64(article.featuredImage.imageId);
        }
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement de l\'article';
        console.error('Error loading article:', error);
      }
    });
  }

  loadImageAsBase64(imageId: string) {
    this.imageUploadService.getImageAsBase64(imageId).subscribe({
      next: (base64Image) => {
        this.previewImage = `data:image/jpeg;base64,${base64Image}`;
      },
      error: (error) => {
        console.error('Error loading image as base64:', error);
        // Fallback: utiliser l'URL directe
        this.previewImage = `http://localhost:3000/api/images/${imageId}`;
      }
    });
  }

  displayImageAsBase64(imageId: string) {
    this.imageUploadService.getImageAsBase64(imageId).subscribe({
      next: (base64Image) => {
        this.previewImage = `data:image/jpeg;base64,${base64Image}`;
      },
      error: (error) => {
        console.error('Error loading image as base64:', error);
      }
    });
  }

  addTag() {
    const tagsInput = this.articleForm.get('tagsInput')?.value?.trim();
    if (tagsInput) {
      const newTags = tagsInput.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
      this.tags = [...this.tags, ...newTags];
      this.articleForm.get('tagsInput')?.setValue('');
    }
  }

  removeTag(index: number) {
    this.tags.splice(index, 1);
    this.tags = [...this.tags];
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Veuillez sélectionner une image valide';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'L\'image ne doit pas dépasser 5MB';
        return;
      }

      // Afficher l'aperçu
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result;
      };
      reader.readAsDataURL(file);

      // Upload vers GridFS
      this.uploadImage(file);
    }
  }

  uploadImage(file: File): void {
    this.errorMessage = '';
    this.uploadProgress = 1; // Commencer la progression
    console.log(file);
    this.imageUploadService.uploadImage(file).subscribe({
      next: (response: any) => {
        if (response.success && response.imageId) {
          this.uploadedImageId = response.imageId;
          this.uploadProgress = 100;

          setTimeout(() => {
            this.uploadProgress = 0;
          }, 1000);
        } else {
          this.errorMessage = response.error || 'Erreur lors de l\'upload de l\'image';
          this.removeImage();
        }
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.errorMessage = 'Erreur de connexion lors de l\'upload de l\'image';
        this.uploadProgress = 0;
        this.removeImage();
      }
    });
  }

  removeImage(): void {
    // Supprimer l'image de GridFS si elle a été uploadée
    if (this.uploadedImageId) {
      this.imageUploadService.deleteImage(this.uploadedImageId).subscribe({
        next: () => {
          console.log('Image deleted from GridFS');
        },
        error: (error) => {
          console.error('Error deleting image:', error);
        }
      });
    }

    this.previewImage = null;
    this.uploadedImageId = null;
    this.uploadProgress = 0;
    this.articleForm.patchValue({ featuredImage: '' });
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onSubmit() {
    if (this.articleForm.valid && this.tags.length > 0) {
      this.loading = true;
      this.errorMessage = '';

      // Préparer les données de l'image GridFS
      const featuredImage = this.uploadedImageId ? {
        imageId: this.uploadedImageId,
        filename: this.fileInput.nativeElement.files?.[0]?.name || 'image',
        url: this.imageUploadService.getImageUrl(this.uploadedImageId),
        originalName: this.fileInput.nativeElement.files?.[0]?.name || 'image',
        mimetype: this.fileInput.nativeElement.files?.[0]?.type || 'image/jpeg',
        size: this.fileInput.nativeElement.files?.[0]?.size || 0
      } : undefined;

      const formData: ArticleCreateRequest = {
        title: this.articleForm.value.title!,
        content: this.articleForm.value.content!,
        excerpt: this.articleForm.value.excerpt || '',
        featuredImage: featuredImage,
        tags: this.tags,
        status: this.articleForm.value.status as 'draft' | 'published'
      };

      const operation = this.isEdit
        ? this.articleService.updateArticle(this.articleId!, formData)
        : this.articleService.createArticle(formData);

      operation.subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.error || 'Une erreur est survenue lors de la publication';
          console.error('Submit error:', error);
        }
      });
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires et ajouter au moins un tag';
    }
  }
}
