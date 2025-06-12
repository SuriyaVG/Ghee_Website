import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
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
import { motion } from 'framer-motion';

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
    <section id="contact" className="py-24 bg-warm-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-playfair font-bold text-deep-brown mb-6">Get in Touch</h2>
          <p className="text-xl lg:text-2xl text-rich-earth max-w-4xl mx-auto leading-relaxed">
            Have questions about our products or want to place a bulk order? We&apos;re here to help!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-card shadow-premium-lg rounded-3xl border border-luxury-gold/20">
              <CardContent className="p-10">
                <h3 className="text-3xl font-playfair font-bold text-deep-brown mb-8">
                  Send us a Message
                </h3>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName" className="text-deep-brown font-semibold text-lg">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        {...form.register('firstName')}
                        placeholder="Ranjith"
                        className={`border-2 border-luxury-gold/30 focus:border-luxury-gold focus:ring-luxury-gold mt-2 h-12 text-lg ${form.formState.errors.firstName ? 'border-destructive' : ''}`}
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-deep-brown font-semibold text-lg">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        {...form.register('lastName')}
                        placeholder="G"
                        className={`border-2 border-luxury-gold/30 focus:border-luxury-gold focus:ring-luxury-gold mt-2 h-12 text-lg ${form.formState.errors.lastName ? 'border-destructive' : ''}`}
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-deep-brown font-semibold text-lg">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      placeholder="ranjith@example.com"
                      className={`border-2 border-luxury-gold/30 focus:border-luxury-gold focus:ring-luxury-gold mt-2 h-12 text-lg ${form.formState.errors.email ? 'border-destructive' : ''}`}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-deep-brown font-semibold text-lg">
                      Phone (Optional)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      {...form.register('phone')}
                      placeholder="+919876543210"
                      className={`border-2 border-luxury-gold/30 focus:border-luxury-gold focus:ring-luxury-gold mt-2 h-12 text-lg ${form.formState.errors.phone ? 'border-destructive' : ''}`}
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-deep-brown font-semibold text-lg">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      {...form.register('message')}
                      placeholder="Tell us about your requirements..."
                      rows={5}
                      className={`border-2 border-luxury-gold/30 focus:border-luxury-gold focus:ring-luxury-gold resize-none mt-2 text-lg ${form.formState.errors.message ? 'border-destructive' : ''}`}
                    />
                    {form.formState.errors.message && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.message.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={contactMutation.isPending || !form.formState.isDirty || !form.formState.isValid}
                    className="w-full bg-gradient-gold text-white hover:shadow-premium-lg hover:scale-105 transition-all duration-300 py-4 text-lg font-semibold"
                    size="lg"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {contactMutation.isPending ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div 
            className="space-y-8 lg:col-span-1"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-card border border-luxury-gold/20 rounded-3xl shadow-premium-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-playfair font-bold mb-8 text-deep-brown">Contact Information</h3>
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <MapPin className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-playfair font-bold mb-2 text-deep-brown text-lg">Address</h4>
                      <p className="text-rich-earth leading-relaxed">
                        2-119, Mattampatti, konaganapuram
                        <br />
                        salem, Tamil Nadu-637102
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Phone className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-playfair font-bold mb-2 text-deep-brown text-lg">Phone</h4>
                      <p className="text-rich-earth leading-relaxed">
                        +91 9994287614
                        <br />
                        +91 7904094521
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Mail className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-playfair font-bold mb-2 text-deep-brown text-lg">Email</h4>
                      <p className="text-rich-earth leading-relaxed">
                        info@gsrghee.com
                        <br />
                        orders@gsrghee.com
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Clock className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-playfair font-bold mb-2 text-deep-brown text-lg">Business Hours</h4>
                      <p className="text-rich-earth leading-relaxed">
                        Mon - Sat: 9:00 AM - 7:00 PM
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Order Section */}
            <Card className="bg-card border border-luxury-gold/20 shadow-premium-lg rounded-3xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-playfair font-bold text-deep-brown mb-6">
                  Quick Order
                </h3>
                <p className="text-rich-earth mb-8 leading-relaxed">
                  Call us directly for bulk orders or immediate delivery
                </p>
                <div className="space-y-4">
                  <Button
                    asChild
                    className="w-full bg-gradient-gold text-white hover:shadow-premium-lg hover:scale-105 transition-all duration-300 py-4 text-lg font-semibold"
                    size="lg"
                  >
                    <a href="tel:+919994287614">
                      <Phone className="w-5 h-5 mr-2" />
                      Call Now
                    </a>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-green-500 text-white hover:bg-green-600 hover:shadow-premium-lg hover:scale-105 transition-all duration-300 py-4 text-lg font-semibold"
                    size="lg"
                  >
                    <a href="https://wa.me/919994287614" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
