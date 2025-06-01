import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { InsertContact } from '@shared/schema';
import { useZodForm } from '@/hooks/use-zod-form';
import { insertContactSchema } from '@shared/schemas/contacts';

export function Contact() {
  const { toast } = useToast();

  const form = useZodForm({
    schema: insertContactSchema,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = await apiRequest('POST', '/api/contacts', data);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to submit form' }));
        throw new Error(errorData.message || 'Failed to submit form');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Message sent successfully!',
        description: 'Thank you for your message. We will get back to you within 24 hours.',
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error sending message',
        description: error.message || 'Please try again later or contact us directly.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: InsertContact) => {
    contactMutation.mutate(data);
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-playfair font-bold text-foreground mb-4">Get in Touch</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions about our products or want to place a bulk order? We&apos;re here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <Card className="bg-card lg:col-span-2 shadow-xl rounded-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-playfair font-bold text-foreground mb-6">
                Send us a Message
              </h3>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-foreground">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      {...form.register('firstName')}
                      placeholder="Ranjith"
                      className={`border-input focus:border-primary focus:ring-ring ${form.formState.errors.firstName ? 'border-destructive' : ''}`}
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-foreground">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      {...form.register('lastName')}
                      placeholder="G"
                      className={`border-input focus:border-primary focus:ring-ring ${form.formState.errors.lastName ? 'border-destructive' : ''}`}
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="ranjith@example.com"
                    className={`border-input focus:border-primary focus:ring-ring ${form.formState.errors.email ? 'border-destructive' : ''}`}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone" className="text-foreground">
                    Phone (Optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    {...form.register('phone')}
                    placeholder="+919876543210"
                    className={`border-input focus:border-primary focus:ring-ring ${form.formState.errors.phone ? 'border-destructive' : ''}`}
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="message" className="text-foreground">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    {...form.register('message')}
                    placeholder="Tell us about your requirements..."
                    rows={4}
                    className={`border-input focus:border-primary focus:ring-ring resize-none ${form.formState.errors.message ? 'border-destructive' : ''}`}
                  />
                  {form.formState.errors.message && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.message.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={contactMutation.isPending || !form.formState.isDirty || !form.formState.isValid}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors py-3 text-lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {contactMutation.isPending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8 lg:col-span-1">
            <div className="bg-card text-card-foreground border border-border rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-playfair font-bold mb-6 text-foreground">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-muted-foreground w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-playfair font-bold mb-1 text-foreground">Address</h4>
                    <p className="text-muted-foreground">
                      2-119, Mattampatti, konaganapuram
                      <br />
                      salem, Tamil Nadu-637102
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="text-muted-foreground w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-playfair font-bold mb-1 text-foreground">Phone</h4>
                    <p className="text-muted-foreground">
                      +91 9994287614
                      <br />
                      +91 7904094521
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="text-muted-foreground w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-playfair font-bold mb-1 text-foreground">Email</h4>
                    <p className="text-muted-foreground">
                      info@gsrghee.com
                      <br />
                      orders@gsrghee.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="text-muted-foreground w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-playfair font-bold mb-1 text-foreground">Business Hours</h4>
                    <p className="text-muted-foreground">
                      Mon - Sat: 9:00 AM - 7:00 PM
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Order Section */}
            <Card className="bg-card border-border shadow-xl rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-playfair font-bold text-foreground mb-4">
                  Quick Order
                </h3>
                <p className="text-muted-foreground mb-6">
                  Call us directly for bulk orders or immediate delivery
                </p>
                <div className="space-y-4">
                  <Button
                    asChild
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors py-3 text-lg"
                  >
                    <a href="tel:+919994287614">
                      <Phone className="w-5 h-5 mr-2" />
                      Call Now
                    </a>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-green-500 text-white hover:bg-green-600 transition-colors py-3 text-lg"
                  >
                    <a href="https://wa.me/919994287614" target="_blank" rel="noopener noreferrer">
                      <img src="/images/whatsapp-icon.svg" alt="WhatsApp" className="w-5 h-5 mr-2" />
                      Message on WhatsApp
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
