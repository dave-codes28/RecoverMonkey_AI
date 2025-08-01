"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var supabaseAdmin_1 = require("../src/lib/supabaseAdmin");
// Helper: get conversation_ids already in inquiries
function getConversationIdsInInquiries() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabaseAdmin_1.default
                        .from('inquiries')
                        .select('conversation_id')];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error || !data)
                        return [2 /*return*/, []];
                    return [2 /*return*/, data.map(function (row) { return row.conversation_id; }) || []];
            }
        });
    });
}
// Helper: extract cart info from metadata JSON
function extractCartInfo(metadata) {
    if (!metadata || typeof metadata !== 'object')
        return {};
    // Adjust this logic if your cart info is nested differently
    var cart = metadata.cart || metadata.cart_info || {};
    return {
        cart_id: cart.cart_id || null,
        cart_value: cart.cart_value || null,
        currency: cart.currency || null,
    };
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var conversationIdsInInquiries, _a, chatLogs, error, newLogs, _i, newLogs_1, log, cartInfo, inquiry, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getConversationIdsInInquiries()];
                case 1:
                    conversationIdsInInquiries = _b.sent();
                    return [4 /*yield*/, supabaseAdmin_1.default
                            .from('chat_log')
                            .select('*')
                            .eq('status', 'ended')
                            .not('summary', 'is', null)];
                case 2:
                    _a = _b.sent(), chatLogs = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching chat_log:', error);
                        return [2 /*return*/];
                    }
                    if (!chatLogs || chatLogs.length === 0) {
                        console.log('No ended chat logs found.');
                        return [2 /*return*/];
                    }
                    newLogs = chatLogs.filter(function (log) { return !conversationIdsInInquiries.includes(log.session_id); });
                    _i = 0, newLogs_1 = newLogs;
                    _b.label = 3;
                case 3:
                    if (!(_i < newLogs_1.length)) return [3 /*break*/, 8];
                    log = newLogs_1[_i];
                    cartInfo = extractCartInfo(log.metadata);
                    inquiry = {
                        customer_email: log.customer_email,
                        cart_id: cartInfo.cart_id,
                        cart_value: cartInfo.cart_value,
                        currency: cartInfo.currency,
                        query_summary: log.summary,
                        full_query: log.messages, // or log.text if you want just the last message
                        conversation_id: log.session_id,
                        status: log.status,
                        response: null,
                        created_at: log.ended_at || log.timestamp,
                        responded_at: null,
                        updated_at: log.ended_at || log.timestamp,
                        shop_id: log.shop_id,
                        session_id: log.session_id,
                    };
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, supabaseAdmin_1.default.from('inquiries').upsert([inquiry], { onConflict: ['conversation_id'] })];
                case 5:
                    _b.sent();
                    console.log("Upserted inquiry for session ".concat(log.session_id));
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _b.sent();
                    console.error('Failed to upsert inquiry for session', log.session_id, err_1);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8: return [2 /*return*/];
            }
        });
    });
}
main().then(function () { return process.exit(0); }).catch(function (e) { console.error(e); process.exit(1); });
