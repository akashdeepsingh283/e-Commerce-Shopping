import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';

// Use relative path so dev server proxy (vite) forwards to backend.
// If you run frontend without the proxy, set VITE_BACKEND_URL and use absolute URLs instead.
const CONTACT_ENDPOINT = '/api/contact';

interface ContactPageProps {
  onBack: () => void;
}

export default function ContactPage({ onBack }: ContactPageProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // send to backend which stores message and sends email
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || 'Failed to send message');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-4 py-12 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl font-light tracking-widest text-white mb-6">
            CONTACT US
          </h1>
          <p className="text-zinc-400 text-lg tracking-wide max-w-2xl mx-auto">
            Have a question or need assistance? Our team is here to help you
            find the perfect piece.
          </p>
        </div>

            <button
              onClick={onBack}
              className="text-zinc-400 hover:text-white transition-colors mb-6 tracking-wider"
            >
              ← BACK TO HOME
            </button>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-zinc-950 border border-zinc-800 p-8">
              <h2 className="text-3xl font-light tracking-wider text-white mb-8">
                GET IN TOUCH
              </h2>

              {submitted && (
                <div className="bg-green-900/20 border border-green-900 text-green-400 px-4 py-3 mb-6 flex items-center space-x-2">
                  <Check className="w-5 h-5" />
                  <span>Message sent successfully! We'll get back to you soon.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2 tracking-wider">
                    YOUR NAME
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:border-white focus:outline-none transition-colors"
                    placeholder="Your Full Name"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2 tracking-wider">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:border-white focus:outline-none transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2 tracking-wider">
                    SUBJECT
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:border-white focus:outline-none transition-colors"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2 tracking-wider">
                    MESSAGE
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:border-white focus:outline-none transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black py-4 tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>{loading ? 'SENDING...' : 'SEND MESSAGE'}</span>
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-950 border border-zinc-800 p-8">
              <div className="flex items-start space-x-4 mb-6">
                <div className="bg-zinc-900 p-3 border border-zinc-800">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-light tracking-wider mb-2">
                    EMAIL US
                  </h3>
                  <p className="text-zinc-400">support@noir.com</p>
                  <p className="text-zinc-400">sainamanpearls1@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 mb-6">
                <div className="bg-zinc-900 p-3 border border-zinc-800">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-light tracking-wider mb-2">
                    CALL US
                  </h3>
                  <p className="text-zinc-400">+91 984-947-2755</p>
                  <p className="text-zinc-500 text-sm mt-1">
                    Mon-Fri: 9AM - 6PM EST
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-zinc-900 p-3 border border-zinc-800">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-light tracking-wider mb-2">
                    VISIT US
                  </h3>
                  <p className="text-zinc-400">
                    Sai Naman Pearls
                    <br />
                    ESCI campus Gachibowli,
                    <br />
                    Hyderabad, Telangana 500032.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-8">
              <h3 className="text-2xl font-light tracking-wider text-white mb-4">
                VISITING HOURS
              </h3>
              <div className="space-y-2 text-zinc-400">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>10:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>11:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>12:00 PM - 5:00 PM</span>
                </div>
              </div>
            </div>

            <div className="aspect-video bg-zinc-950 border border-zinc-800 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                <MapPin className="w-12 h-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
