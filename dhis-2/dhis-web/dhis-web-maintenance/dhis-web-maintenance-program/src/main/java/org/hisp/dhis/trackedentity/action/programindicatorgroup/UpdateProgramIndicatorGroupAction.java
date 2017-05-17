package org.hisp.dhis.trackedentity.action.programindicatorgroup;

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

import com.opensymphony.xwork2.Action;
import org.apache.commons.lang3.StringUtils;
import org.hisp.dhis.program.ProgramIndicator;
import org.hisp.dhis.program.ProgramIndicatorGroup;
import org.hisp.dhis.program.ProgramIndicatorService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author Viet Nguyen
 */
public class UpdateProgramIndicatorGroupAction
    implements Action
{
    // -------------------------------------------------------------------------
    // Dependencies
    // -------------------------------------------------------------------------

    @Autowired
    private ProgramIndicatorService programIndicatorService;

    // -------------------------------------------------------------------------
    // Input/Output
    // -------------------------------------------------------------------------

    private Integer id;

    private String name;

    private String description;

    // -------------------------------------------------------------------------
    // Getters && Setters
    // -------------------------------------------------------------------------

    public void setId( Integer id )
    {
        this.id = id;
    }

    public void setName( String name )
    {
        this.name = name;
    }

    public void setDescription( String description )
    {
        this.description = description;
    }

    private List<String> piSelected = new ArrayList<>();

    public void setPiSelected( List<String> piSelected )
    {
        this.piSelected = piSelected;
    }

    // -------------------------------------------------------------------------
    // Action implementation
    // -------------------------------------------------------------------------

    @Override
    public String execute()
        throws Exception
    {
        ProgramIndicatorGroup programIndicatorGroup = programIndicatorService.getProgramIndicatorGroup( id );

        programIndicatorGroup.setName( StringUtils.trimToNull( name ) );
        programIndicatorGroup.setDescription( StringUtils.trimToNull( description ) );

        Set<ProgramIndicator> programIndicators = piSelected.stream()
            .map( programIndicatorId -> programIndicatorService.getProgramIndicatorByUid( programIndicatorId ) ).collect( Collectors.toSet() );

        programIndicatorGroup.setMembers( programIndicators );

        programIndicatorService.updateProgramIndicatorGroup( programIndicatorGroup );

        return SUCCESS;
    }
}