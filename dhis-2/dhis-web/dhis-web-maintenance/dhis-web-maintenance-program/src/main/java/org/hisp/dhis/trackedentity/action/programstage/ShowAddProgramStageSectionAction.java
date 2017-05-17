package org.hisp.dhis.trackedentity.action.programstage;

/*
 * Copyright (c) 2004-2017, University of Oslo
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 * Neither the name of the HISP project nor the names of its contributors may
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.hisp.dhis.program.ProgramIndicator;
import org.hisp.dhis.program.ProgramStage;
import org.hisp.dhis.program.ProgramStageDataElement;
import org.hisp.dhis.program.ProgramStageSection;
import org.hisp.dhis.program.ProgramStageService;
import org.springframework.beans.factory.annotation.Autowired;

import com.opensymphony.xwork2.Action;

/**
 * @author Chau Thu Tran
 * 
 * @version ShowAddProgramStageSectionAction.java 11:29:40 AM Aug 22, 2012 $
 */
public class ShowAddProgramStageSectionAction
    implements Action
{
    // -------------------------------------------------------------------------
    // Dependencies
    // -------------------------------------------------------------------------

    @Autowired
    private ProgramStageService programStageService;

    // -------------------------------------------------------------------------
    // Input/Output
    // -------------------------------------------------------------------------

    private Integer programStageId;
    
    public void setProgramStageId( Integer programStageId )
    {
        this.programStageId = programStageId;
    }
    
    private ProgramStage programStage;

    public ProgramStage getProgramStage()
    {
        return programStage;
    }

    private List<ProgramStageDataElement> availableDataElements;

    public List<ProgramStageDataElement> getAvailableDataElements()
    {
        return availableDataElements;
    }

    private List<ProgramIndicator> availableProgramIndicators;

    public List<ProgramIndicator> getAvailableProgramIndicators()
    {
        return availableProgramIndicators;
    }
    
    // -------------------------------------------------------------------------
    // Action implementation
    // -------------------------------------------------------------------------

    @Override
    public String execute()
        throws Exception
    {
        programStage = programStageService.getProgramStage( programStageId );

        if ( programStage != null && programStage.getProgram() != null )
        {
            availableDataElements = new ArrayList<>( programStage.getProgramStageDataElements() );            
            availableProgramIndicators = new ArrayList<>( programStage.getProgram().getProgramIndicators() );
        
            for ( ProgramStageSection section : programStage.getProgramStageSections() )
            {
                availableDataElements.removeAll( section.getProgramStageDataElements() );
            }
            
            Collections.sort( availableDataElements );
            Collections.sort( availableProgramIndicators );
        }
        
        return SUCCESS;
    }
}
