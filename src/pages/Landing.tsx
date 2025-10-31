import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Send, Wallet, Shield, Zap, Globe, CreditCard, Smartphone, Lock, CheckCircle, Star, Users, TrendingUp, Phone } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useKYC } from '../context/KYCContext';
import WalletConnect from '../components/WalletConnect';
import PhoneOTPModal from '../components/PhoneOTPModal';
import Intro from './Intro';
import ThreeScene from '../components/ThreeScene';

const Landing = () => {
  const { isConnected, account } = useWallet();
  const { user } = useKYC();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Always show intro briefly on each visit
    setShowIntro(true);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setMousePos({ x: (e.clientX - cx) / cx, y: (e.clientY - cy) / cy });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="relative">
      {showIntro && (
        <Intro autoDismiss durationMs={1200} onComplete={() => setShowIntro(false)} />
      )}

      {/* Background international payment vibe */}
      {React.createElement(ThreeScene as any, { mousePosition: mousePos })}

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-sm font-medium text-blue-700 mb-8">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Now supporting UPI to USDT conversion
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Accept payments
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              everywhere
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Enable seamless payments from traditional UPI to modern stablecoins. 
            Your customers pay in INR, you receive USDT instantly. No complexity, just results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            {!user ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                  <Phone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Get Started with StablePay
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Verify your phone number to start accepting payments
                  </p>
                  <button
                    onClick={() => setShowPhoneModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Verify Phone Number</span>
                  </button>
                </div>
              </div>
            ) : !isConnected ? (
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center space-x-3 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Phone Verified: {user.phone}
                  </span>
                </div>
                <WalletConnect />
                <div className="text-sm text-gray-500">or</div>
                <Link
                  to="/send"
                  className="group bg-white text-blue-600 border-2 border-blue-200 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Send className="w-5 h-5" />
                  <span>Try without wallet</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <Wallet className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">
                    Phone: {user.phone} | KYC: {user.kyc_status}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/send"
                    className="group bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Send className="w-5 h-5" />
                    <span>Send Payment</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link
                    to="/receive"
                    className="group bg-white text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Wallet className="w-5 h-5" />
                    <span>View Dashboard</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Remove the old buttons */}
          <div className="hidden">
            <Link
              to="/send"
              className="group bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Send className="w-5 h-5" />
              <span>Start accepting payments</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/receive"
              className="group bg-white text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Wallet className="w-5 h-5" />
              <span>View dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 mb-16">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Bank-level security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Global coverage</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Instant settlement</span>
            </div>
          </div>
        </div>

        {/* Payment Demo Card */}
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {isConnected && (
            <div className="bg-green-50 border-b border-green-200 p-3">
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Wallet Connected</span>
              </div>
            </div>
          )}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Payment Demo</h3>
              <Lock className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold">₹2,500.00</div>
            <div className="text-blue-100 text-sm">≈ $30.00 USDT</div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <span className="font-medium">UPI Payment</span>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Instant Conversion</span>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <Wallet className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">USDT Received</span>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
          
          {!user && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Verify your phone number to try live demo</p>
                <button
                  onClick={() => setShowPhoneModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Phone className="w-4 h-4" />
                  <span>Verify Phone</span>
                </button>
              </div>
            </div>
          )}

          {user && !isConnected && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Connect your wallet to try live demo</p>
                <div className="flex justify-center">
                  <WalletConnect />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for the future of payments
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Bridge traditional and digital payments with enterprise-grade infrastructure
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-blue-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Process payments in seconds with real-time INR to USDT conversion and instant blockchain settlement.
              </p>
              <div className="text-sm text-blue-600 font-medium">
                Average settlement: 3 seconds
              </div>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-green-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Bank-Grade Security</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Built on blockchain technology with MetaMask integration. Your funds are secure and transactions are transparent.
              </p>
              <div className="text-sm text-green-600 font-medium">
                99.99% uptime guaranteed
              </div>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-purple-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Global Reach</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Accept payments from India while receiving stable, borderless USDT that works anywhere in the world.
              </p>
              <div className="text-sm text-purple-600 font-medium">
                Available in 180+ countries
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                $2.4B+
              </div>
              <div className="text-gray-600">Payment volume</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">
                50K+
              </div>
              <div className="text-gray-600">Active merchants</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                99.9%
              </div>
              <div className="text-gray-600">Success rate</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                24/7
              </div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-xl text-gray-600">Three simple steps to start accepting payments</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  1
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-yellow-800" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer pays in INR</h3>
              <p className="text-gray-600 leading-relaxed">
                Your customers use familiar UPI payment methods to pay in Indian Rupees - no crypto knowledge required.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  2
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-green-800" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Instant conversion</h3>
              <p className="text-gray-600 leading-relaxed">
                Our system automatically converts INR to USDT at real-time market rates with minimal fees.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  3
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-blue-800" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">You receive USDT</h3>
              <p className="text-gray-600 leading-relaxed">
                Stable, borderless USDT arrives instantly in your wallet - ready to use globally.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by businesses worldwide</h2>
            <p className="text-xl text-gray-600">See what our merchants are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "StablePay transformed our business. We can now accept payments from Indian customers while receiving stable USDT. The conversion is seamless and instant."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  R
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Rajesh Kumar</div>
                  <div className="text-sm text-gray-500">E-commerce Merchant</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "The security and speed are incredible. Our customers love the familiar UPI experience, and we love receiving stable payments instantly."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  P
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Priya Sharma</div>
                  <div className="text-sm text-gray-500">SaaS Founder</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "Finally, a payment solution that bridges traditional and crypto payments perfectly. Our international expansion became so much easier."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Arjun Patel</div>
                  <div className="text-sm text-gray-500">Digital Agency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to transform your payments?
          </h2>
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Join thousands of merchants already using StablePay to accept seamless INR to USDT payments.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/send"
              className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Send className="w-5 h-5" />
              <span>Get started now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/receive"
              className="group bg-transparent text-white border-2 border-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center space-x-2 transform hover:-translate-y-1"
            >
              <Users className="w-5 h-5" />
              <span>View demo</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-blue-100">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>24/7 support</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Enterprise ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Phone OTP Modal */}
      <PhoneOTPModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onSuccess={() => {
          setShowPhoneModal(false);
        }}
      />
      {/* Guided workflow: Next step */}
      <div className="fixed bottom-6 right-6">
        <Link
          to="/onboarding"
          className="px-5 py-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
        >
          Start Onboarding
        </Link>
      </div>
    </div>
  );
};

export default Landing;