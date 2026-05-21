using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace B2B_V2.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FinancialController : ControllerBase
    {
        private readonly IFinancialService _financialService;

        public FinancialController(IFinancialService financialService)
        {
            _financialService = financialService;
        }

        [HttpGet("invoices/{companyId}")]
        public async Task<ActionResult<IEnumerable<FinancialRecordDto>>> GetCompanyInvoices(Guid companyId)
        {
            var invoices = await _financialService.GetCompanyInvoicesAsync(companyId);
            return Ok(invoices);
        }

        [HttpGet("payouts/{providerId}")]
        public async Task<ActionResult<IEnumerable<FinancialRecordDto>>> GetProviderPayouts(Guid providerId)
        {
            var payouts = await _financialService.GetProviderPayoutsAsync(providerId);
            return Ok(payouts);
        }

        [HttpGet("summary")]
        public async Task<ActionResult<FinancialSummaryDto>> GetPlatformSummary()
        {
            var summary = await _financialService.GetPlatformSummaryAsync();
            return Ok(summary);
        }

        [HttpPost("backfill")]
        [AllowAnonymous]
        public async Task<ActionResult<int>> BackfillFinancialData()
        {
            var count = await _financialService.BackfillFinancialRecordsAsync();
            return Ok(count);
        }

        [HttpPost("{recordId}/mark-company-paid")]
        public async Task<IActionResult> MarkPaidByCompany(Guid recordId)
        {
            var success = await _financialService.MarkAsPaidByCompanyAsync(recordId);
            if (!success) return NotFound();
            return Ok();
        }

        [HttpPost("{recordId}/mark-provider-paid")]
        public async Task<IActionResult> MarkPaidToProvider(Guid recordId)
        {
            var success = await _financialService.MarkAsPaidToProviderAsync(recordId);
            if (!success) return NotFound();
            return Ok();
        }
    }
}
