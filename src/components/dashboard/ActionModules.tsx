import React, { useState, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Calendar as CalendarIcon, Video, Mic, MicOff, VideoOff, PhoneOff, MonitorUp, PhoneCall, FileText, Upload, PenTool, CheckCircle, Clock, Wallet, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, ArrowRight, CreditCard, Bell } from 'lucide-react';
import { Button } from '../ui/Button';
import { SignaturePad } from '../ui/SignaturePad';
import { Badge } from '../ui/Badge';
import { User, AvailabilitySlot, MeetingRequest } from '../../types';
import { availabilitySlots, meetingRequests } from '../../data/meetings';
import { DashboardTour } from './DashboardTour';

interface ActionModulesProps {
  user: User;
}

export const ActionModules: React.FC<ActionModulesProps> = ({ user }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);

  // Call State
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Document State
  const [docStatus, setDocStatus] = useState<'Draft' | 'In Review' | 'Signed'>('Draft');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calendar State
  const [date, setDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<AvailabilitySlot[]>(availabilitySlots);
  const [requests, setRequests] = useState<MeetingRequest[]>(meetingRequests);
  const [newSlotTime, setNewSlotTime] = useState('10:00');

  const selectedDateSlots = slots.filter(s => new Date(s.startTime).toDateString() === date.toDateString());
  const confirmedMeetings = requests.filter(r => r.status === 'accepted');
  const pendingMeetings = requests.filter(r => r.status === 'pending');

  const addSlot = () => {
    const [hours, minutes] = newSlotTime.split(':');
    const start = new Date(date);
    start.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1); // 1 hour slots by default

    const newSlot: AvailabilitySlot = {
      id: `slot-${Date.now()}`,
      userId: user.id,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      isBooked: false
    };
    setSlots([...slots, newSlot]);
  };

  const deleteSlot = (id: string) => {
    setSlots(slots.filter(s => s.id !== id));
  };

  const handleRequest = (id: string, status: 'accepted' | 'declined') => {
    setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
    // If accepted, mark slot as booked
    if (status === 'accepted') {
      const req = requests.find(r => r.id === id);
      if (req) {
        setSlots(slots.map(s => s.id === req.slotId ? { ...s, isBooked: true } : s));
      }
    }
  };

  // Wallet State
  const [showWallet, setShowWallet] = useState(false);
  const [walletBalance, setWalletBalance] = useState(24500.00);
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'funding', amount: 150000, sender: 'Acme Ventures', receiver: 'My Wallet', status: 'Pending', date: '2023-10-15' },
    { id: 2, type: 'transfer', amount: 450, sender: 'My Wallet', receiver: 'Design Agency', status: 'Completed', date: '2023-10-10' },
    { id: 3, type: 'withdrawal', amount: 3500, sender: 'My Wallet', receiver: 'Bank Account ...4567', status: 'Completed', date: '2023-10-05' },
    { id: 4, type: 'deposit', amount: 50000, sender: 'System', receiver: 'My Wallet', status: 'Completed', date: '2023-10-01' },
  ]);
  const [walletAction, setWalletAction] = useState<'deposit' | 'withdraw' | 'transfer' | null>(null);
  const [actionAmount, setActionAmount] = useState('');
  const [actionRecipient, setActionRecipient] = useState('');

  const handleWalletAction = () => {
    const amount = parseFloat(actionAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (walletAction === 'deposit') {
      setWalletBalance(prev => prev + amount);
      setTransactions([{ id: Date.now(), type: 'deposit', amount, sender: 'Bank Account', receiver: 'My Wallet', status: 'Completed', date: new Date().toISOString().split('T')[0] }, ...transactions]);
    } else if (walletAction === 'withdraw') {
      if (amount > walletBalance) return;
      setWalletBalance(prev => prev - amount);
      setTransactions([{ id: Date.now(), type: 'withdrawal', amount, sender: 'My Wallet', receiver: 'Bank Account', status: 'Completed', date: new Date().toISOString().split('T')[0] }, ...transactions]);
    } else if (walletAction === 'transfer') {
      if (amount > walletBalance) return;
      setWalletBalance(prev => prev - amount);
      setTransactions([{ id: Date.now(), type: 'transfer', amount, sender: 'My Wallet', receiver: actionRecipient || 'Unknown', status: 'Completed', date: new Date().toISOString().split('T')[0] }, ...transactions]);
    }

    setWalletAction(null);
    setActionAmount('');
    setActionRecipient('');
  };

  const handleAcceptFunding = (id: number, amount: number) => {
    setWalletBalance(prev => prev + amount);
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'Completed' } : t));
  };

  return (
    <div className="flex flex-col items-start w-full gap-4 mt-8 mb-8" id="action-modules-section">
      <DashboardTour />
      <div className="flex flex-wrap gap-4 w-full">
        <Button
          onClick={() => {
            setShowCalendar(!showCalendar);
            if (!showCalendar) { setShowVideoCall(false); setShowDocuments(false); setShowWallet(false); }
          }}
          variant={showCalendar ? "primary" : "outline"}
          leftIcon={<CalendarIcon size={18} />}
          id="tour-calendar-btn"
        >
          {showCalendar ? 'Hide Calendar' : 'Calendar'}
        </Button>

        <Button
          onClick={() => {
            setShowVideoCall(!showVideoCall);
            if (!showVideoCall) { setShowCalendar(false); setShowDocuments(false); setShowWallet(false); }
          }}
          variant={showVideoCall ? "primary" : "outline"}
          leftIcon={<Video size={18} />}
          id="tour-video-btn"
        >
          {showVideoCall ? 'Hide Video Call' : 'Video Call'}
        </Button>

        <Button
          onClick={() => {
            setShowDocuments(!showDocuments);
            if (!showDocuments) { setShowCalendar(false); setShowVideoCall(false); setShowWallet(false); }
          }}
          variant={showDocuments ? "primary" : "outline"}
          leftIcon={<FileText size={18} />}
          id="tour-docs-btn"
        >
          {showDocuments ? 'Hide Documents' : 'Documents'}
        </Button>

        <Button
          onClick={() => {
            setShowWallet(!showWallet);
            if (!showWallet) { setShowCalendar(false); setShowVideoCall(false); setShowDocuments(false); }
          }}
          variant={showWallet ? "primary" : "outline"}
          leftIcon={<Wallet size={18} />}
          id="tour-wallet-btn"
        >
          {showWallet ? 'Hide Wallet' : 'Wallet'}
        </Button>
      </div>

      {showCalendar && (
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-5xl animate-fade-in flex flex-col md:flex-row gap-8">
          {/* Calendar Left Side */}
          <div className="flex-1 max-w-sm">
            <Calendar onChange={(val) => setDate(val as Date)} value={date} className="w-full border-none shadow-sm rounded-lg p-2" />

            <div className="mt-6 border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Availability on {date.toLocaleDateString()}</h4>
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2">
                {selectedDateSlots.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No timeslots available.</p>
                ) : (
                  selectedDateSlots.map(slot => (
                    <div key={slot.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-100">
                      <span className="text-sm font-medium text-gray-700">{new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <div className="flex items-center space-x-2">
                        {slot.isBooked && <Badge variant="primary" className="bg-green-100 text-green-800 border-green-200">Booked</Badge>}
                        {!slot.isBooked && <button onClick={() => deleteSlot(slot.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Remove</button>}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex space-x-2 mt-4">
                <input type="time" value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-1 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                <Button size="sm" onClick={addSlot} className="whitespace-nowrap">Add Slot</Button>
              </div>
            </div>
          </div>

          {/* Right Side: Requests and Confirmed Meetings */}
          <div className="flex-1 flex flex-col space-y-6">
            {/* Pending Requests */}
            <div className="bg-yellow-50/50 p-5 rounded-xl border border-yellow-200 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center text-sm uppercase tracking-wide">
                <Bell size={16} className="text-yellow-600 mr-2" />
                Meeting Requests ({pendingMeetings.length})
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {pendingMeetings.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No new requests.</p>
                ) : (
                  pendingMeetings.map(req => {
                    const slot = slots.find(s => s.id === req.slotId);
                    return (
                      <div key={req.id} className="bg-white p-4 rounded-lg border border-yellow-100 shadow-sm text-sm transition-all hover:border-yellow-300">
                        <p className="font-semibold text-gray-800 mb-1">Investor ID: {req.senderId} wants to meet</p>
                        {slot && <p className="text-primary-600 font-medium my-1 flex items-center"><CalendarIcon size={14} className="mr-1.5" />{new Date(slot.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>}
                        <p className="text-gray-600 text-sm italic mt-2 bg-gray-50 p-2 rounded-md border-l-2 border-gray-200">"{req.message}"</p>
                        <div className="flex space-x-3 mt-4">
                          <Button size="sm" onClick={() => handleRequest(req.id, 'accepted')} className="bg-green-600 hover:bg-green-700 flex-1">Accept Request</Button>
                          <Button size="sm" variant="outline" onClick={() => handleRequest(req.id, 'declined')} className="flex-1 text-gray-600">Decline</Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Confirmed Meetings */}
            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-200 shadow-sm flex-1">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center text-sm uppercase tracking-wide">
                <CalendarIcon size={16} className="text-blue-600 mr-2" />
                Confirmed Meetings
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {confirmedMeetings.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No upcoming meetings.</p>
                ) : (
                  confirmedMeetings.map(req => {
                    const slot = slots.find(s => s.id === req.slotId);
                    return (
                      <div key={req.id} className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm transition-all hover:border-blue-300">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-gray-800 text-md">Meeting with ID: {req.senderId}</p>
                            {slot && <p className="text-blue-600 text-sm font-medium mt-1 flex items-center"><Clock size={14} className="mr-1.5" />{new Date(slot.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>}
                          </div>
                          <Badge variant="primary" className="bg-blue-100 text-blue-800 border-blue-200">Confirmed</Badge>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <Button size="sm" variant="outline" className="w-full text-blue-700 border-blue-200 hover:bg-blue-50" leftIcon={<Video size={16} />} onClick={() => { setShowVideoCall(true); setShowCalendar(false); }}>Join Video Call</Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showVideoCall && (
        <div className="p-6 bg-gray-900 rounded-lg shadow-xl border border-gray-800 w-full max-w-2xl text-white animate-fade-in">
          <div className="flex flex-col items-center">
            {/* Video Area */}
            <div className={`w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center mb-6 overflow-hidden relative ${!isCallActive ? 'border-2 border-dashed border-gray-600' : ''}`}>
              {!isCallActive ? (
                <div className="text-gray-400 flex flex-col items-center">
                  <Video size={48} className="mb-2 opacity-50" />
                  <p>Ready to join?</p>
                </div>
              ) : (
                <div className="w-full h-full relative flex items-center justify-center bg-gray-700">
                  {!isVideoOn ? (
                    <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-semibold">ME</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <span className="text-gray-500 font-medium">Camera Active</span>
                    </div>
                  )}

                  {/* Small self view (simulating other user view) */}
                  <div className="absolute bottom-4 right-4 w-1/4 aspect-video bg-gray-900 rounded border border-gray-600 shadow-lg flex items-center justify-center hidden sm:flex">
                    <span className="text-xs text-gray-400">Other User</span>
                  </div>

                  {isScreenSharing && (
                    <div className="absolute top-4 left-4 bg-blue-600 text-xs px-2 py-1 rounded text-white flex items-center">
                      <MonitorUp size={14} className="mr-1" /> Sharing Screen
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {isCallActive ? (
                <>
                  <button
                    onClick={() => setIsAudioOn(!isAudioOn)}
                    className={`p-3 rounded-full flex items-center justify-center transition-colors ${isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
                    title={isAudioOn ? "Mute" : "Unmute"}
                  >
                    {isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
                  </button>
                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`p-3 rounded-full flex items-center justify-center transition-colors ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
                    title={isVideoOn ? "Stop Video" : "Start Video"}
                  >
                    {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                  </button>
                  <button
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`p-3 rounded-full flex items-center justify-center transition-colors ${isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    title="Share Screen"
                  >
                    <MonitorUp size={20} />
                  </button>
                  <button
                    onClick={() => setIsCallActive(false)}
                    className="p-3 bg-red-500 rounded-full hover:bg-red-600 px-6 font-semibold flex items-center transition-colors"
                  >
                    <PhoneOff size={20} className="mr-2" /> <span className="hidden sm:inline">End Call</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsCallActive(true)}
                  className="px-6 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 shadow flex items-center transition-colors"
                >
                  <PhoneCall size={20} className="mr-2" /> Start Call
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showWallet && (
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-4xl animate-fade-in text-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
            <h3 className="text-xl font-semibold flex items-center">
              <Wallet className="mr-2 text-primary-600" size={24} />
              Financial Dashboard
            </h3>
            <div className="sm:text-right">
              <p className="text-sm text-gray-500 font-medium">Available Balance</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions */}
            <div className="xl:col-span-1 border border-gray-200 rounded-lg p-4 sm:p-5 bg-gray-50 flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <RefreshCw className="mr-2 text-primary-500" size={18} /> Quick Actions
                </h4>

                {!walletAction ? (
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => setWalletAction('deposit')} leftIcon={<ArrowDownRight className="text-green-500" size={18} />}>Deposit Funds</Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setWalletAction('withdraw')} leftIcon={<ArrowUpRight className="text-red-500" size={18} />}>Withdraw Funds</Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setWalletAction('transfer')} leftIcon={<RefreshCw className="text-blue-500" size={18} />}>Transfer to User</Button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-sm font-medium text-gray-700 capitalize">
                      {walletAction} (Simulation)
                    </p>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Amount ($)</label>
                      <input
                        type="number"
                        value={actionAmount}
                        onChange={(e) => setActionAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary-500 focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>

                    {walletAction === 'transfer' && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Recipient</label>
                        <input
                          type="text"
                          value={actionRecipient}
                          onChange={(e) => setActionRecipient(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary-500 focus:outline-none"
                          placeholder="Email or Name"
                        />
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button className="flex-1" onClick={handleWalletAction}>Submit</Button>
                      <Button variant="outline" onClick={() => { setWalletAction(null); setActionAmount(''); setActionRecipient(''); }}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Funding Deal Mock Flow */}
            <div className="xl:col-span-2 border border-gray-200 rounded-lg p-4 sm:p-5 bg-primary-50/30">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-800 flex items-center">
                  <DollarSign className="mr-2 text-green-600" size={18} /> Funding Deal Flow
                </h4>
                <Badge variant="success">Active Deals</Badge>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {transactions.filter(t => t.type === 'funding').map(deal => (
                  <div key={deal.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
                    {deal.status === 'Completed' && (
                      <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                        <div className="absolute transform rotate-45 bg-green-500 text-white text-[10px] font-bold py-1 right-[-35px] top-[15px] w-[120px] text-center shadow">
                          FUNDED
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center text-sm mb-2 gap-2">
                          <span className="font-semibold text-gray-800">{deal.sender}</span>
                          <ArrowRight size={14} className="text-gray-400" />
                          <span className="font-semibold text-gray-800">You ({user.name})</span>
                        </div>
                        <p className="font-medium text-gray-700">Proposed Amount: ${deal.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">Date: {deal.date}</p>
                      </div>

                      <div>
                        {deal.status === 'Pending' ? (
                          <Button
                            size="sm"
                            onClick={() => handleAcceptFunding(deal.id, deal.amount)}
                            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
                          >
                            Accept
                          </Button>
                        ) : (
                          <Badge variant="primary" className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle size={12} className="mr-1" /> Received
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {transactions.filter(t => t.type === 'funding').length === 0 && (
                  <div className="text-center py-6 bg-white rounded border border-gray-200 text-gray-500 text-sm">
                    No active funding deals right now.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <CreditCard className="mr-2 text-gray-500" size={18} /> Transaction History
            </h4>
            <div className="overflow-x-auto border rounded max-h-[300px]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Details</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.date}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize flex items-center">
                        {tx.type === 'deposit' && <ArrowDownRight size={14} className="mr-1.5 text-green-500 flex-shrink-0" />}
                        {tx.type === 'withdrawal' && <ArrowUpRight size={14} className="mr-1.5 text-red-500 flex-shrink-0" />}
                        {tx.type === 'transfer' && <RefreshCw size={14} className="mr-1.5 text-blue-500 flex-shrink-0" />}
                        {tx.type === 'funding' && <DollarSign size={14} className="mr-1.5 text-green-600 flex-shrink-0" />}
                        <span className="hidden sm:inline">{tx.type}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                        {tx.sender} <ArrowRight size={12} className="inline mx-1 text-gray-400" /> {tx.receiver}
                      </td>
                      <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${tx.type === 'deposit' || tx.type === 'funding' || (tx.type === 'transfer' && tx.receiver === 'My Wallet') ? 'text-green-600' : 'text-gray-900'}`}>
                        {tx.type === 'deposit' || tx.type === 'funding' || (tx.type === 'transfer' && tx.receiver === 'My Wallet') ? '+' : '-'}
                        ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showDocuments && (
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-4xl animate-fade-in text-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
            <h3 className="text-lg sm:text-xl font-semibold flex items-center break-all">
              <FileText className="mr-2 text-primary-600 flex-shrink-0" size={24} />
              Term_Sheet_Agreement_v2.pdf
            </h3>

            {/* Status Label */}
            <div className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center flex-shrink-0 ${docStatus === 'Draft' ? 'bg-gray-100 text-gray-700' :
                docStatus === 'In Review' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
              }`}>
              {docStatus === 'Draft' && <FileText size={16} className="mr-1.5" />}
              {docStatus === 'In Review' && <Clock size={16} className="mr-1.5" />}
              {docStatus === 'Signed' && <CheckCircle size={16} className="mr-1.5" />}
              {docStatus}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document Preview Area */}
            <div className="border border-gray-200 rounded-lg bg-gray-50 flex flex-col h-[300px] sm:h-96">
              <div className="p-3 border-b bg-gray-100 flex justify-between items-center text-sm text-gray-600">
                <span>{uploadedFile ? 'Page 1 of 1' : 'Page 1 of 5'}</span>
                <div className="flex space-x-2">
                  <button className="hover:text-primary-600 border border-gray-300 bg-white px-2 py-0.5 rounded text-xs transition-colors hidden sm:block">Zoom In</button>
                  <button className="hover:text-primary-600 border border-gray-300 bg-white px-2 py-0.5 rounded text-xs transition-colors">Print</button>
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <FileText size={48} className={uploadedFile ? "text-primary-500 mb-3" : "text-gray-300 mb-3"} />
                <p className="text-sm font-medium text-gray-700 truncate w-full px-4">
                  {uploadedFile ? uploadedFile.name : "Document Preview"}
                </p>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  {uploadedFile ? "File loaded successfully" : "Click below to upload a document"}
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setUploadedFile(e.target.files[0]);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Upload size={16} />}
                  onClick={() => fileInputRef.current?.click()}
                  className="max-w-[80%]"
                >
                  <span className="truncate">{uploadedFile ? "Replace File" : "Upload File"}</span>
                </Button>
              </div>
            </div>

            {/* Signature & Actions Area */}
            <div className="flex flex-col">
              <h4 className="font-medium text-gray-800 mb-3">E-Signature Requirements</h4>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 sm:p-4 mb-4 text-xs sm:text-sm text-blue-800">
                Please review the document carefully. Once satisfied, apply your signature below.
              </div>

              {/* Status Toggle (For mockup purposes) */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Simulate Document Status:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setDocStatus('Draft')}
                    className={`px-3 py-1.5 text-xs rounded border transition-colors flex-1 ${docStatus === 'Draft' ? 'bg-gray-200 border-gray-300 font-medium' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                  >Draft</button>
                  <button
                    onClick={() => setDocStatus('In Review')}
                    className={`px-3 py-1.5 text-xs rounded border transition-colors flex-1 ${docStatus === 'In Review' ? 'bg-yellow-50 border-yellow-200 font-medium text-yellow-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                  >Review</button>
                  <button
                    onClick={() => setDocStatus('Signed')}
                    className={`px-3 py-1.5 text-xs rounded border transition-colors flex-1 ${docStatus === 'Signed' ? 'bg-green-50 border-green-200 font-medium text-green-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                  >Signed</button>
                </div>
              </div>

              <div className="flex-1"></div>

              {/* Signature Pad */}
              <div className="mt-auto">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-sm font-medium text-gray-700">Your Signature</label>
                  {signatureData && (
                    <button onClick={() => { setSignatureData(null); setDocStatus('In Review'); }} className="text-xs text-red-500 hover:text-red-700 transition-colors">
                      Clear
                    </button>
                  )}
                </div>
                <div className={`h-32 border-2 ${!signatureData ? 'border-dashed border-gray-300 bg-gray-50' : 'border-solid border-green-300 bg-white'} rounded-lg mb-4 flex items-center justify-center relative overflow-hidden group`}>
                  {!signatureData ? (
                    <div className="w-full h-full relative">
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none group-hover:opacity-70 transition-opacity">
                        <PenTool size={28} className="mx-auto mb-2 text-gray-400 opacity-50" />
                        <span className="text-sm font-medium text-gray-400 opacity-80 z-0">Draw signature here</span>
                      </div>
                      <SignaturePad
                        className="w-full h-full z-10 relative cursor-crosshair touch-none"
                        onEnd={(dataUrl) => {
                          setSignatureData(dataUrl);
                          setDocStatus('Signed');
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full relative bg-green-50/30">
                      <img src={signatureData} alt="Signature" className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  disabled={!signatureData}
                  variant={signatureData ? 'primary' : 'outline'}
                  leftIcon={<CheckCircle size={18} />}
                >
                  {signatureData ? 'Submit Signed Document' : 'Sign to Submit'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
