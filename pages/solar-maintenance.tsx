import { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Paper, 
  CircularProgress,
  Alert,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function SolarMaintenance() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setError('File size too large. Please upload an image under 5MB.');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!imageFile && !description) {
      setError('Please upload an image or provide a description.');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append('image', imageFile);
      }
      formData.append('description', description);

      const response = await fetch('/api/solar-maintenance', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze solar panel');
      }

      const data = await response.json();
      setResult(data.recommendation);
    } catch (error) {
      console.error('Error:', error);
      setError('Error analyzing solar panel maintenance needs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setDescription('');
    setResult(null);
    setError(null);
  };

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          AI Solar Panel Maintenance Check
        </Typography>
        
        <Paper elevation={3}>
          <Box p={4}>
            {error && (
              <Box mb={3}>
                <Alert severity="error">{error}</Alert>
              </Box>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <Typography variant="body1">
                  Upload a photo of your solar panel and provide any relevant details about its condition
                  or concerns you may have.
                </Typography>

                <Card variant="outlined">
                  <CardContent>
                    <Box 
                      sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 1,
                        p: 3,
                        textAlign: 'center'
                      }}
                    >
                      <input
                        accept="image/*"
                        type="file"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Button
                          component="span"
                          variant="contained"
                          startIcon={<CloudUploadIcon />}
                        >
                          Upload Photo
                        </Button>
                      </label>
                      
                      {imagePreview && (
                        <Box mt={2}>
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '200px',
                              objectFit: 'contain' 
                            }} 
                          />
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe any issues or concerns (e.g., reduced efficiency, visible damage, age of panels)"
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? <CircularProgress size={24} /> : 'Analyze Maintenance Needs'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    Reset
                  </Button>
                </Box>
              </Stack>
            </form>

            {result && (
              <Box mt={3}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Analysis completed successfully!
                </Alert>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Maintenance Recommendations:
                    </Typography>
                    <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
                      {result}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 